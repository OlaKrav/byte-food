import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../types';

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
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: null,
      avatar: null,
    };
    const mockToken = 'access-token-xyz';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
  });

  it('should clear all data when logout is called', () => {
    const mockUser: User = {
      id: '1',
      email: 'a@a.com',
      name: null,
      avatar: null,
    };
    useAuthStore.getState().setAuth(mockUser, 'token');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
