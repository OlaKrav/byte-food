import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from '@tanstack/react-router';
import { GoogleLogin } from '@react-oauth/google';
import { GOOGLE_AUTH_MUTATION } from '../graphql/auth';
import type { GoogleAuthResponse } from '../types';

export function LoginWithGoogle() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [authWithGoogle, { loading, error }] = useMutation<GoogleAuthResponse>(GOOGLE_AUTH_MUTATION);

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || 'Failed to authenticate with Google. Please try again.');
    }
  }, [error]);

  const handleSuccess = async (response: any) => {
    setErrorMessage('');
    try {
      const { data } = await authWithGoogle({
        variables: { idToken: response.credential }
      });

      if (data?.authWithGoogle?.token) {
        localStorage.setItem('token', data.authWithGoogle.token);
        navigate({ to: '/' });
      }
    } catch (err: unknown) {
      let message = 'Failed to authenticate with Google. Please try again.';
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        message = err.message;
      }
      setErrorMessage(message);
      console.error('Error authenticating with Google:', err);
    }
  };

  const handleError = () => {
    setErrorMessage('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <div className="google-login-container">
      <h3>Sign in with Google</h3>
      {errorMessage && (
        <p className="error">{errorMessage}</p>
      )}
      <GoogleLogin 
        onSuccess={handleSuccess} 
        onError={handleError}
      />
      {loading && <p className="google-loading">Loading...</p>}
    </div>
  );
}
