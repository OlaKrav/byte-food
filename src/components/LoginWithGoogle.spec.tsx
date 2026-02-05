import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from '@tanstack/react-router';
import type { Mock } from 'vitest';
import { LoginWithGoogle } from './LoginWithGoogle';

vi.mock('@apollo/client/react');
vi.mock('@tanstack/react-router');
vi.mock('../store/authStore');
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: vi.fn(({ onSuccess, onError }) => (
    <div data-testid="google-login-mock">
      <button onClick={() => onSuccess({ credential: 'fake-google-token' })}>
        Success
      </button>
      <button onClick={() => onError()}>Error</button>
    </div>
  )),
}));

const mockedUseNavigate = useNavigate as Mock;
const mockedUseMutation = useMutation as unknown as Mock;
const mockedUseAuthStore = useAuthStore as unknown as Mock;

describe('LoginWithGoogle', () => {
  const mockNavigate = vi.fn();
  const mockSetAuth = vi.fn();
  const mockAuthMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseNavigate.mockReturnValue(mockNavigate);
    mockedUseAuthStore.mockReturnValue(mockSetAuth);

    mockedUseMutation.mockReturnValue([
      mockAuthMutation,
      { loading: false, error: undefined },
    ]);
  });

  it('renders Google login button and title', () => {
    render(<LoginWithGoogle />);
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    expect(screen.getByTestId('google-login-mock')).toBeInTheDocument();
  });

  it('successful google login sets auth and navigates to home', async () => {
    const mockResponse = {
      data: {
        authWithGoogle: {
          token: 'server-jwt-token',
          user: { id: '123', email: 'test@gmail.com', name: 'Google User' },
        },
      },
    };
    mockAuthMutation.mockResolvedValue(mockResponse);

    render(<LoginWithGoogle />);

    fireEvent.click(screen.getByText('Success'));

    await waitFor(() => {
      expect(mockAuthMutation).toHaveBeenCalledWith({
        variables: { idToken: 'fake-google-token' },
      });
    });

    expect(mockSetAuth).toHaveBeenCalledWith(
      expect.objectContaining({ id: '123', name: 'Google User' }),
      'server-jwt-token'
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('shows local error message when Google sign-in fails', async () => {
    render(<LoginWithGoogle />);

    fireEvent.click(screen.getByText('Error'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Google sign-in was cancelled or failed/i);
  });

  it('shows Apollo error message when server mutation fails', async () => {
    mockedUseMutation.mockReturnValue([
      mockAuthMutation,
      { loading: false, error: { message: 'Server validation failed' } },
    ]);

    render(<LoginWithGoogle />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Server validation failed');
  });

  it('shows loading state during mutation', () => {
    mockedUseMutation.mockReturnValue([
      mockAuthMutation,
      { loading: true, error: undefined },
    ]);

    render(<LoginWithGoogle />);
    expect(screen.getByText(/Verifying account.../i)).toBeInTheDocument();
  });

  it('calls the store selector correctly', () => {
    render(<LoginWithGoogle />);

    const selector = mockedUseAuthStore.mock.calls[0][0];
    const mockState = { setAuth: mockSetAuth };

    expect(selector(mockState)).toBe(mockSetAuth);
  });
});
