import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initialize with null user and accessToken', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('should update user and accessToken when setAuth is called', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockToken = 'access-token-xyz';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
  });

  it('should clear all data when logout is called', () => {
    useAuthStore.getState().setAuth({ id: '1', email: 'a@a.com' } as any, 'token');
    
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});