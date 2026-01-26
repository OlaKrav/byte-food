import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './apolloClient.ts';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <GoogleOAuthProvider 
        clientId="1063881109533-mvlrnuak4nqqb3hl4k4c76ovk85c1hiu.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </ApolloProvider>
  </StrictMode>
);
