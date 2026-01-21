import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '../graphql/auth';
import type { LoginResponse, LoginVariables } from '../types';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading, error }] = useMutation<LoginResponse, LoginVariables>(LOGIN_MUTATION);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { email, password } });
      
      if (data?.login.token) {
        localStorage.setItem('token', data.login.token);
        alert('Welcome to ByteFood!');
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="auth-container">
      <h2>ByteFood Login</h2>
      {error && <p className="error">{error.message}</p>}
      
      <form onSubmit={handleEmailLogin} className="email-form">
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Connecting...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};