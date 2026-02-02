import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Observable } from '@apollo/client/utilities';
import { useAuthStore } from './store/authStore';
import { REFRESH_TOKEN_MUTATION } from './graphql/auth';
import type { RefreshTokenResponse } from './types';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const httpLink = createHttpLink({
  uri: 'http://localhost:5000/graphql',
  credentials: 'include',
});

const refreshHttpLink = createHttpLink({
  uri: 'http://localhost:5000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().accessToken;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const refreshClient = new ApolloClient({
  link: refreshHttpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

const errorLink = onError(({ error, operation, forward }) => {
  const handleRefresh = (): Observable<any> => {
    if (isRefreshing) {
      return new Observable((observer) => {
        failedQueue.push({
          resolve: () => {
            const token = useAuthStore.getState().accessToken;
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                authorization: token ? `Bearer ${token}` : '',
              },
            });
            forward(operation).subscribe(observer);
          },
          reject: (err) => {
            useAuthStore.getState().logout();
            observer.error(err);
          },
        });
      });
    }

    isRefreshing = true;

    return new Observable((observer) => {
      refreshClient
        .mutate<RefreshTokenResponse>({
          mutation: REFRESH_TOKEN_MUTATION,
          fetchPolicy: 'no-cache',
        })
        .then((response) => {
          const { token, user } = response.data?.refreshToken || {};
          
          if (token && user) {
            useAuthStore.getState().setAuth(user, token);
            processQueue(null, token);
            
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                authorization: `Bearer ${token}`,
              },
            });
            
            forward(operation).subscribe(observer);
          } else {
            throw new Error('Failed to refresh token');
          }
        })
        .catch((err) => {
          processQueue(err, null);
          useAuthStore.getState().logout();
          observer.error(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  };

  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('Unauthorized')) {
        return handleRefresh();
      }
    }
  }

  if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401) {
    return handleRefresh();
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
