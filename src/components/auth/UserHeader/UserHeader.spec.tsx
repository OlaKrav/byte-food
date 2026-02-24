import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useNavigate } from '@tanstack/react-router';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserHeader } from '.';
import { useAuthStore } from '../../../store/authStore';
import type { GetMeData } from '../../../types';

vi.mock('@apollo/client/react');
vi.mock('@tanstack/react-router');
vi.mock('../../../store/authStore');

const mockedUseNavigate = useNavigate as Mock;
const mockedUseMutation = useMutation as unknown as Mock;
const mockedUseApolloClient = useApolloClient as Mock;
const mockedUseAuthStore = useAuthStore as unknown as Mock;

const mockClient = new ApolloClient({
  link: new HttpLink({ uri: '/mock-graphql' }),
  cache: new InMemoryCache(),
});

const resetStoreSpy = vi.spyOn(mockClient, 'resetStore');

describe('UserHeader', () => {
  const mockUser: NonNullable<GetMeData['me']> = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockNavigate = vi.fn();
  const mockLogout = vi.fn();
  const mockLogoutMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    resetStoreSpy.mockImplementation(() => Promise.resolve([]));

    mockedUseNavigate.mockReturnValue(mockNavigate);
    mockedUseApolloClient.mockReturnValue(mockClient);
    mockedUseAuthStore.mockReturnValue(mockLogout);

    mockedUseMutation.mockReturnValue([
      mockLogoutMutation,
      { loading: false, client: mockClient },
    ]);
  });

  it('renders user information correctly', () => {
    render(<UserHeader user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Signed in as:')).toBeInTheDocument();

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toHaveAttribute('src', mockUser.avatar);
  });

  it('renders fallback initial when avatar is missing', () => {
    const userWithoutAvatar = { ...mockUser, avatar: null };
    render(<UserHeader user={userWithoutAvatar} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders "U" fallback when name is also missing', () => {
    const anonymousUser = { ...mockUser, name: null, avatar: null };
    render(<UserHeader user={anonymousUser} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('performs full logout sequence on button click', async () => {
    mockLogoutMutation.mockResolvedValue({ data: { logout: true } });

    render(<UserHeader user={mockUser} />);

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockLogoutMutation).toHaveBeenCalled();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(resetStoreSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth' });
  });

  it('handles logout error gracefully and still cleans up', async () => {
    mockLogoutMutation.mockRejectedValue(new Error('Logout failed'));

    render(<UserHeader user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(mockLogoutMutation).toHaveBeenCalled();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(resetStoreSpy).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth' });
  });

  it('calls the store selector with correct state', () => {
    render(<UserHeader user={mockUser} />);

    expect(mockedUseAuthStore).toHaveBeenCalledWith(expect.any(Function));

    const selector = mockedUseAuthStore.mock.calls[0][0];
    const dummyState = { logout: mockLogout };
    expect(selector(dummyState)).toBe(mockLogout);
  });

  it('defines handleLogout as an async function and executes it fully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogoutMutation.mockRejectedValue(new Error('GraphQL Error'));

    render(<UserHeader user={mockUser} />);
    const button = screen.getByRole('button');

    await fireEvent.click(button);

    expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    expect(mockLogout).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
