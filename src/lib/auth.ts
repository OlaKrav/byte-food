import { redirect } from '@tanstack/react-router';
import { client, refreshClient } from '../apolloClient';
import { GET_ME, REFRESH_TOKEN_MUTATION } from '../graphql/auth';
import type { GetMeData, User, RefreshTokenResponse } from '../types';
import { useAuthStore } from '../store/authStore';

export function hasToken(): boolean {
  return !!useAuthStore.getState().accessToken;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const { data } = await refreshClient.mutate<RefreshTokenResponse>({
      mutation: REFRESH_TOKEN_MUTATION,
      fetchPolicy: 'no-cache',
    });

    const { token, user } = data?.refreshToken || {};

    if (token && user) {
      useAuthStore.getState().setAuth(user, token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

function updateUserData(user: User): void {
  const currentToken = useAuthStore.getState().accessToken;
  if (currentToken) {
    useAuthStore.getState().setAuth(user, currentToken);
  }
}

async function fetchUserData(): Promise<User | null> {
  try {
    const { data } = await client.query<GetMeData>({
      query: GET_ME,
      fetchPolicy: 'network-only',
    });

    return data?.me || null;
  } catch (err) {
    if (err && typeof err === 'object' && 'to' in err) {
      throw err;
    }
    return null;
  }
}

export async function requireAuth(): Promise<{ me: User }> {
  if (!useAuthStore.getState().accessToken) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      throw redirect({ to: '/auth' });
    }
  }

  let user = await fetchUserData();

  if (!user) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      throw redirect({ to: '/auth' });
    }

    user = await fetchUserData();
    if (!user) {
      throw redirect({ to: '/auth' });
    }
  }

  updateUserData(user);
  return { me: user };
}

export async function redirectIfAuthenticated(): Promise<void> {
  if (!useAuthStore.getState().accessToken) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      return;
    }
  }

  try {
    const user = await fetchUserData();
    if (user) {
      updateUserData(user);
      throw redirect({ to: '/' });
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'to' in err) {
      throw err;
    }
  }
}
