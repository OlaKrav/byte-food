import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './store/authStore';
import { Observable, type Operation } from '@apollo/client';
import type { Mock } from 'vitest';
import {
  authActions,
  authLink,
  refreshClient,
  refreshState,
} from './apolloClient';

vi.mock('./apolloClient', async (importActual) => {
  const actual = await importActual<typeof import('./apolloClient')>();
  return {
    ...actual,
    handleTokenRefresh: vi.fn(),
  };
});

vi.mock('./store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

describe('Apollo Client Setup & Auth Logic', () => {
  const mockSetAuth = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    refreshState.isRefreshing = false;
    refreshState.failedQueue = [];

    (useAuthStore.getState as Mock).mockReturnValue({
      accessToken: 'initial-token',
      setAuth: mockSetAuth,
      logout: mockLogout,
    });
  });

  describe('authLink', () => {
    it('should inject the Bearer token into headers', async () => {
      (useAuthStore.getState as Mock).mockReturnValue({
        accessToken: 'initial-token',
      });

      const mockOperation = {
        setContext: vi.fn(),
        getContext: vi
          .fn()
          .mockReturnValue({ headers: { 'existing-header': 'value' } }),
      } as unknown as Operation;

      const mockForward = vi.fn().mockReturnValue(
        new Observable((observer) => {
          observer.next({ data: {} });
          observer.complete();
        })
      );

      const execution = authLink.request(mockOperation, mockForward);

      if (execution) {
        await new Promise((resolve) => {
          execution.subscribe({
            next: () => resolve(null),
            error: () => resolve(null),
          });
        });
      }

      expect(mockOperation.setContext).toHaveBeenCalled();

      const lastCall = (mockOperation.setContext as Mock).mock.calls[0][0];
      expect(lastCall.headers.authorization).toBe('Bearer initial-token');
    });
  });

  describe('refreshState.processQueue', () => {
    it('should resolve all pending requests when token is refreshed', () => {
      const resolveSpy = vi.fn();
      refreshState.failedQueue.push({ resolve: resolveSpy, reject: vi.fn() });

      refreshState.processQueue(null, 'new-token');

      expect(resolveSpy).toHaveBeenCalledWith('new-token');
      expect(refreshState.failedQueue.length).toBe(0);
    });

    it('should reject all pending requests when refresh fails', () => {
      const rejectSpy = vi.fn();
      const error = new Error('Network Error');
      refreshState.failedQueue.push({ resolve: vi.fn(), reject: rejectSpy });

      refreshState.processQueue(error);

      expect(rejectSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('errorLinkHandler Coverage', () => {
    it('should trigger the refresh logic on 401', () => {
      const refreshSpy = vi
        .spyOn(authActions, 'handleTokenRefresh')
        .mockImplementation(() => ({}) as any);

      const mockForward = vi.fn();
      const mockOp = { setContext: vi.fn(), getContext: () => ({}) } as any;

      authActions.errorLinkHandler({
        networkError: { statusCode: 401 },
        operation: mockOp,
        forward: mockForward,
      });

      expect(refreshSpy).toHaveBeenCalled();

      refreshSpy.mockRestore();
    });
  });

  describe('handleTokenRefresh', () => {
    it('should queue multiple unauthorized requests and resolve them together', async () => {
      refreshState.isRefreshing = true;

      const mockOperation = {
        setContext: vi.fn(),
        getContext: () => ({ headers: {} }),
      } as unknown as Operation;
      const mockForward = vi.fn().mockReturnValue(
        new Observable((observer) => {
          observer.next({ data: { ok: true } });
          observer.complete();
        })
      );

      const observer = authActions.handleTokenRefresh(
        mockOperation,
        mockForward
      );
      const sub = observer.subscribe({});

      expect(refreshState.failedQueue.length).toBe(1);

      (useAuthStore.getState as Mock).mockReturnValue({
        accessToken: 'new-token',
      });
      refreshState.processQueue(null, 'new-token');

      expect(mockOperation.setContext).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: 'Bearer new-token',
          }),
        })
      );
      expect(mockForward).toHaveBeenCalled();
      sub.unsubscribe();
    });

    it('should call refreshClient.mutate and update store on success', async () => {
      const mutateSpy = vi.spyOn(refreshClient, 'mutate').mockResolvedValue({
        data: {
          refreshToken: {
            token: 'fresh-token',
            user: { id: '1', name: 'John' },
          },
        },
      });

      const mockOperation = {
        setContext: vi.fn(),
        getContext: () => ({ headers: {} }),
      } as unknown as Operation;
      const mockForward = vi.fn().mockReturnValue(
        new Observable((observer) => {
          observer.next({ data: {} });
          observer.complete();
        })
      );

      const observable = authActions.handleTokenRefresh(
        mockOperation,
        mockForward
      );

      await new Promise((resolve) => {
        observable.subscribe({
          next: () => {
            expect(mutateSpy).toHaveBeenCalled();
            expect(mockSetAuth).toHaveBeenCalledWith(
              expect.any(Object),
              'fresh-token'
            );
            expect(mockOperation.setContext).toHaveBeenCalledWith(
              expect.objectContaining({
                headers: expect.objectContaining({
                  authorization: 'Bearer fresh-token',
                }),
              })
            );
            resolve(null);
          },
        });
      });
    });

    it('should logout user if the refresh mutation fails', async () => {
      vi.spyOn(refreshClient, 'mutate').mockRejectedValue(
        new Error('Refresh expired')
      );

      const mockOperation = {
        setContext: vi.fn(),
        getContext: () => ({ headers: {} }),
      } as unknown as Operation;

      const observable = authActions.handleTokenRefresh(mockOperation, vi.fn());

      await new Promise((resolve) => {
        observable.subscribe({
          error: (err) => {
            expect(err.message).toBe('Refresh expired');
            expect(mockLogout).toHaveBeenCalled();
            resolve(null);
          },
        });
      });
    });
  });
});
