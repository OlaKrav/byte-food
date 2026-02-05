import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from './store/authStore';
import { REFRESH_TOKEN_MUTATION } from './graphql/auth';
import type { Operation, FetchResult } from '@apollo/client';
import type { RefreshTokenResponse } from './types';

interface QueuedRequest {
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}

export const refreshState = {
  isRefreshing: false,
  failedQueue: [] as QueuedRequest[],

  processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) =>
      error ? prom.reject(error) : prom.resolve(token)
    );
    this.failedQueue = [];
  },
};

const API_URL = import.meta.env.VITE_API_URL;

export const refreshClient = new ApolloClient({
  link: createHttpLink({ uri: API_URL, credentials: 'include' }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'no-cache' },
    mutate: { fetchPolicy: 'no-cache' },
  },
});

export const authActions = {
  handleTokenRefresh(
    operation: Operation,
    forward: (op: Operation) => Observable<FetchResult>
  ): Observable<FetchResult> {
    if (refreshState.isRefreshing) {
      return new Observable((observer) => {
        refreshState.failedQueue.push({
          resolve: (token) => {
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                authorization: token ? `Bearer ${token}` : '',
              },
            });
            forward(operation).subscribe(observer);
          },
          reject: (err) => observer.error(err),
        });
      });
    }

    refreshState.isRefreshing = true;

    return new Observable((observer) => {
      refreshClient
        .mutate<RefreshTokenResponse>({ mutation: REFRESH_TOKEN_MUTATION })
        .then((response) => {
          const { token, user } = response.data?.refreshToken || {};
          if (token && user) {
            useAuthStore.getState().setAuth(user, token);
            refreshState.processQueue(null, token);
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                authorization: `Bearer ${token}`,
              },
            });
            forward(operation).subscribe(observer);
          } else {
            throw new Error('Refresh failed');
          }
        })
        .catch((err) => {
          refreshState.processQueue(err, null);
          useAuthStore.getState().logout();
          observer.error(err);
        })
        .finally(() => {
          refreshState.isRefreshing = false;
        });
    });
  },
  errorLinkHandler({ graphQLErrors, networkError, operation, forward }: any) {
    const isUnauthenticated = graphQLErrors?.some(
      (err: any) =>
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.message.includes('Unauthorized')
    );

    const isNetwork401 =
      networkError &&
      'statusCode' in networkError &&
      networkError.statusCode === 401;

    if ((isUnauthenticated || isNetwork401) && forward) {
      return authActions.handleTokenRefresh(operation, forward);
    }
  },
};

export const errorLink = onError((args) => authActions.errorLinkHandler(args));

export const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = createHttpLink({ uri: API_URL, credentials: 'include' });

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
