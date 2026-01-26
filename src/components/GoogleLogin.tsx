import { useMutation } from '@apollo/client/react';
import { GoogleLogin } from '@react-oauth/google';
import { GOOGLE_AUTH_MUTATION } from '../graphql/auth';
import type { GoogleAuthResponse } from '../types';

export function LoginWithGoogle() {
  const [authWithGoogle, { loading }] = useMutation<GoogleAuthResponse>(GOOGLE_AUTH_MUTATION);

  const handleSuccess = async (response: any) => {
    try {
      const { data } = await authWithGoogle({
        variables: { idToken: response.credential }
      });

      if (data?.authWithGoogle?.token) {
        localStorage.setItem('token', data.authWithGoogle.token);
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Ошибка при авторизации через Google:', err);
    }
  };

  return (
    <div>
      <h3>Войти через Google</h3>
      <GoogleLogin 
        onSuccess={handleSuccess} 
        onError={() => console.log('Login Failed')} 
      />
      {loading && <p>Загрузка...</p>}
    </div>
  );
}