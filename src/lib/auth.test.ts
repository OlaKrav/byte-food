import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasToken, redirectIfAuthenticated, requireAuth } from './auth';
import { useAuthStore } from '../store/authStore';
import { client, refreshClient } from '../apolloClient';
import { redirect } from '@tanstack/react-router';
import type { User } from '../types';

vi.mock('../apolloClient', () => ({
  client: { query: vi.fn() },
  refreshClient: { mutate: vi.fn() },
}));

vi.mock('@tanstack/react-router', () => ({
  redirect: vi.fn((obj) => {
    return obj;
  }),
}));

describe('hasToken', () => {
  it('should return true when accessToken exists', () => {
    useAuthStore.getState().setAuth({ id: '1' } as User, 'fake-token');

    expect(hasToken()).toBe(true);
  });

  it('should return false when accessToken is null', () => {
    useAuthStore.getState().logout();

    expect(hasToken()).toBe(false);
  });
});

describe('Auth Utils (requireAuth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('should redirect to /auth if no token and refresh fails', async () => {
    const mutateMock = vi.mocked(refreshClient.mutate);
    mutateMock.mockImplementation(async () => ({
      data: { refreshToken: null },
    }));

    try {
      await requireAuth();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/auth' });
    }
  });

  it('should return user data if token exists and fetching user succeeds', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      name: null,
      avatar: null,
    };

    useAuthStore.getState().setAuth(mockUser, 'valid-token');

    const queryMock = vi.mocked(client.query);
    queryMock.mockResolvedValue({ data: { me: mockUser } });

    const result = await requireAuth();

    expect(result).toEqual({ me: mockUser });
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('should try to refresh token if token is missing but refresh succeeds', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      name: null,
      avatar: null,
    };
    const mockToken = 'new-access-token';

    const mutateMock = vi.mocked(refreshClient.mutate);
    mutateMock.mockImplementation(async () => ({
      data: { refreshToken: { token: mockToken, user: mockUser } },
    }));

    const queryMock = vi.mocked(client.query);
    queryMock.mockResolvedValue({
      data: { me: mockUser },
    });

    const result = await requireAuth();

    expect(refreshClient.mutate).toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe(mockToken);
    expect(result).toEqual({ me: mockUser });
  });

  it('should refresh and retry if token exists but fetchUserData returns null', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      name: null,
      avatar: null,
    };
    useAuthStore.getState().setAuth(mockUser, 'expired-token');

    const queryMock = vi.mocked(client.query);
    queryMock.mockResolvedValueOnce({ data: { me: null } });

    const mutateMock = vi.mocked(refreshClient.mutate);
    mutateMock.mockResolvedValueOnce({
      data: { refreshToken: { token: 'new-token', user: mockUser } },
    });

    queryMock.mockResolvedValueOnce({ data: { me: mockUser } });

    const result = await requireAuth();

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ me: mockUser });
  });

  it('should redirect if token exists, fetchUserData fails, and then refresh also fails', async () => {
    useAuthStore.getState().setAuth({ id: '1' } as User, 'bad-token');

    vi.mocked(client.query).mockResolvedValue({ data: { me: null } });
    vi.mocked(refreshClient.mutate).mockResolvedValue({
      data: { refreshToken: null },
    });

    try {
      await requireAuth();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/auth' });
    }
  });

  it('should redirect to /auth if refreshClient.mutate throws an error', async () => {
    vi.mocked(refreshClient.mutate).mockRejectedValue(
      new Error('Network Error')
    );

    try {
      await requireAuth();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/auth' });
    }
  });

  it('should re-throw if error in fetchUserData is a redirect', async () => {
    const redirectError = { to: '/somewhere-else' };
    vi.mocked(client.query).mockRejectedValue(redirectError);

    useAuthStore.getState().setAuth({ id: '1' } as User, 'token');

    try {
      await requireAuth();
    } catch (err) {
      expect(err).toEqual(redirectError);
    }
  });

  it('should return null in fetchUserData when a non-redirect error occurs', async () => {
    const networkError = new Error('Network failure');
    vi.mocked(client.query).mockRejectedValue(networkError);

    useAuthStore.getState().setAuth({ id: '1' } as User, 'valid-token');

    vi.mocked(refreshClient.mutate).mockResolvedValue({
      data: { refreshToken: null },
    });

    try {
      await requireAuth();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/auth' });
    }
  });
});

describe('Auth Utils (redirectIfAuthenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('should redirect to "/" if user is already authenticated', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@test.com',
      name: 'User',
    } as User;
    useAuthStore.getState().setAuth(mockUser, 'valid-token');

    vi.mocked(client.query).mockResolvedValue({ data: { me: mockUser } });

    try {
      await redirectIfAuthenticated();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/' });
    }
  });

  it('should allow stay on page if no token and refresh fails', async () => {
    vi.mocked(refreshClient.mutate).mockResolvedValue({
      data: { refreshToken: null },
    });

    await expect(redirectIfAuthenticated()).resolves.not.toThrow();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should redirect to "/" if token is missing but refresh succeeds and user is fetched', async () => {
    const mockUser: User = { id: '1', email: 'test@test.com' } as User;

    vi.mocked(refreshClient.mutate).mockResolvedValue({
      data: { refreshToken: { token: 'new-token', user: mockUser } },
    });
    vi.mocked(client.query).mockResolvedValue({ data: { me: mockUser } });

    try {
      await redirectIfAuthenticated();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/' });
      expect(useAuthStore.getState().accessToken).toBe('new-token');
    }
  });

  it('should not redirect if fetchUserData returns null (even if refresh succeeded)', async () => {
    vi.mocked(refreshClient.mutate).mockResolvedValue({
      data: { refreshToken: { token: 'token', user: { id: '1' } as User } },
    });
    vi.mocked(client.query).mockResolvedValue({ data: { me: null } });

    await redirectIfAuthenticated();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should throw the final redirect if user is still null after successful refresh', async () => {
    useAuthStore.getState().setAuth({ id: '1' } as User, 'initial-token');

    const queryMock = vi.mocked(client.query);
    const mutateMock = vi.mocked(refreshClient.mutate);

    queryMock.mockResolvedValueOnce({ data: { me: null } });

    mutateMock.mockResolvedValueOnce({
      data: { refreshToken: { token: 'new-token', user: { id: '1' } as User } },
    });

    queryMock.mockResolvedValueOnce({ data: { me: null } });

    try {
      await requireAuth();
    } catch {
      expect(redirect).toHaveBeenCalledWith({ to: '/auth' });
    }

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(mutateMock).toHaveBeenCalledTimes(1);
  });
});
