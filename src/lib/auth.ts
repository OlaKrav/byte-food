import { redirect } from '@tanstack/react-router';
import { client } from '../apolloClient';
import { GET_ME } from '../graphql/auth';
import type { GetMeData, User } from '../types';

export function hasToken(): boolean {
  return !!localStorage.getItem('token');
}

export async function requireAuth(): Promise<{ me: User }> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw redirect({ to: '/auth' });
  }

  try {
    const { data } = await client.query<GetMeData>({
      query: GET_ME,
      fetchPolicy: 'network-only',
    });

    if (!data?.me) {
      throw redirect({ to: '/auth' });
    }

    return { me: data.me as User };
  } catch (err) {
    if (err && typeof err === 'object' && 'to' in err) {
      throw err;
    }
    console.error('Auth validation error:', err);
    throw redirect({ to: '/auth' });
  }
}

export async function redirectIfAuthenticated(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  try {
    const { data } = await client.query<GetMeData>({
      query: GET_ME,
      fetchPolicy: 'network-only',
    });

    if (data?.me) {
      throw redirect({ to: '/' });
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'to' in err) {
      throw err;
    }
  }
}

