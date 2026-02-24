import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@apollo/client/react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { GOOGLE_AUTH_MUTATION } from '../../../graphql/auth';
import type { GoogleAuthResponse } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import styles from './LoginWithGoogle.module.css';

export function LoginWithGoogle() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [localError, setLocalError] = useState<string | null>(null);

  const [authWithGoogle, { loading, error: apolloError }] =
    useMutation<GoogleAuthResponse>(GOOGLE_AUTH_MUTATION);

  const errorMessage = apolloError?.message || localError;

  const handleSuccess = async (response: CredentialResponse) => {
    setLocalError(null);

    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      const { data } = await authWithGoogle({
        variables: { idToken: response.credential },
      });

      if (data?.authWithGoogle?.token && data?.authWithGoogle?.user) {
        const user = {
          ...data.authWithGoogle.user,
          avatar: null,
        };
        setAuth(user, data.authWithGoogle.token);
        navigate({ to: '/' });
      }
    } catch (err) {
      console.error('Error authenticating with Google:', err);
    }
  };

  const handleError = () => {
    setLocalError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Sign in with Google</h3>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <div className={styles.btnWrapper} data-testid="google-login-container">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>

      {loading && <p className={styles.loading}>Verifying account...</p>}
    </div>
  );
}
