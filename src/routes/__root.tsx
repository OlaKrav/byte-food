import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ApolloProvider } from '@apollo/client/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { client } from '../apolloClient';

export const Route = createRootRoute({
  component: () => (
    <ApolloProvider client={client}>
      <GoogleOAuthProvider clientId="1063881109533-mvlrnuak4nqqb3hl4k4c76ovk85c1hiu.apps.googleusercontent.com">
        <Outlet />
      </GoogleOAuthProvider>
    </ApolloProvider>
  ),
});
