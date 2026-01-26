import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/auth';
import type { LoginResponse, LoginVariables, RegisterResponse, RegisterVariables } from '../types';
import { LoginWithGoogle } from './GoogleLogin';

export const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [login, { loading: loginLoading, error: loginError }] = useMutation<
    LoginResponse,
    LoginVariables
  >(LOGIN_MUTATION);

  const [registerMutation, { loading: regLoading, error: regError }] = useMutation<
    RegisterResponse,
    RegisterVariables
  >(REGISTER_MUTATION);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { email, password } });

      if (data?.login.token) {
        localStorage.setItem('token', data.login.token);
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await registerMutation({
        variables: { email, password, name }
      });
      
      if (data?.register.token) {
        localStorage.setItem('token', data.register.token);
        window.location.href = '/';
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const error = isRegister ? regError : loginError;
  const isLoading = loginLoading || regLoading;

  return (
    <div className="auth-container">
      <div>
        <h2>{isRegister ? 'Create Account' : 'Welcome to ByteFood'}</h2>

        {error && (
          <p className="error">
            {error.message}
          </p>
        )}

        <form onSubmit={isRegister ? handleRegister : handleEmailLogin} className="email-form">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <p className="toggle-auth">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsRegister(!isRegister)} className="btn-link" type="button">
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <div className="divider">
          <span>OR</span>
        </div>

        <LoginWithGoogle />
      </div>
    </div>
  );
};
