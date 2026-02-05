import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from './AuthForm';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from '@tanstack/react-router';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/auth';
import type { Mock } from 'vitest';

vi.mock('@apollo/client/react');
vi.mock('@tanstack/react-router');
vi.mock('../store/authStore');

vi.mock('./LoginWithGoogle', () => ({
  LoginWithGoogle: () => <div data-testid="google-mock">Google Login</div>,
}));

const mockedUseNavigate = useNavigate as Mock;
const mockedUseMutation = useMutation as unknown as Mock;
const mockedUseAuthStore = useAuthStore as unknown as Mock;

describe('AuthForm', () => {
  const mockNavigate = vi.fn();
  const mockSetAuth = vi.fn();
  const mockLoginMutation = vi.fn();
  const mockRegisterMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseNavigate.mockReturnValue(mockNavigate);
    mockedUseAuthStore.mockReturnValue(mockSetAuth);

    mockedUseMutation.mockImplementation((mutation) => {
      if (mutation === LOGIN_MUTATION) {
        return [mockLoginMutation, { loading: false, error: undefined }];
      }
      if (mutation === REGISTER_MUTATION) {
        return [mockRegisterMutation, { loading: false, error: undefined }];
      }
      return [vi.fn(), { loading: false }];
    });
  });

  it('renders login mode by default', () => {
    render(<AuthForm />);
    expect(
      screen.getByRole('heading', { name: /Welcome to ByteFood/i })
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Full Name/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Sign In$/i })
    ).toBeInTheDocument();
  });

  it('switches to register mode and back', () => {
    render(<AuthForm />);

    fireEvent.click(screen.getByText(/Sign up/i));
    expect(
      screen.getByRole('heading', { name: /Create Account/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Sign in/i));
    expect(
      screen.getByRole('heading', { name: /Welcome to ByteFood/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    render(<AuthForm />);

    fireEvent.submit(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Password is required/i)
    ).toBeInTheDocument();
  });

  it('calls login mutation on successful submit', async () => {
    mockLoginMutation.mockResolvedValue({
      data: {
        login: {
          token: 'jwt-123',
          user: { id: '1', name: 'User', email: 't@t.com' },
        },
      },
    });

    render(<AuthForm />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith({
        variables: { email: 'test@test.com', password: 'Password123' },
      });
    });

    expect(mockSetAuth).toHaveBeenCalledWith(expect.any(Object), 'jwt-123');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('calls register mutation with trimmed name', async () => {
    mockRegisterMutation.mockResolvedValue({
      data: {
        register: {
          token: 'jwt-reg',
          user: { id: '2', name: 'New User', email: 'n@n.com' },
        },
      },
    });

    render(<AuthForm />);
    fireEvent.click(screen.getByText(/Sign up/i));

    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), {
      target: { value: '  John Doe  ' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'new@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalledWith({
        variables: {
          email: 'new@test.com',
          password: 'Password123',
          name: 'John Doe',
        },
      });
    });
  });

  it('disables inputs and shows processing state during loading', () => {
    mockedUseMutation.mockImplementation((mutation) => {
      if (mutation === LOGIN_MUTATION) {
        return [vi.fn(), { loading: true, error: undefined }];
      }
      return [vi.fn(), { loading: false }];
    });

    render(<AuthForm />);

    const submitBtn = screen.getByRole('button', { name: /Processing.../i });
    expect(submitBtn).toBeDisabled();
    expect(screen.getByPlaceholderText(/Email/i)).toBeDisabled();
  });
});
