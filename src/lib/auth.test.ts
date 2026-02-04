import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from './auth';
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
});
