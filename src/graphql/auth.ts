import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      name
    }
  }
`;

export const GOOGLE_AUTH_MUTATION = gql`
  mutation AuthWithGoogle($idToken: String!) {
    authWithGoogle(idToken: $idToken) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;