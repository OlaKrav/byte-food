import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from '@tanstack/react-router';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../../../graphql/auth';
import type { LoginResponse, RegisterResponse } from '../../../types';
import { LoginWithGoogle } from '../LoginWithGoogle';
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from '../../../lib/validation';
import { useAuthStore } from '../../../store/authStore';
import styles from './AuthForm.module.css';

export const AuthForm = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: {
      errors: loginErrors,
      isValid: isLoginValid,
      isSubmitted: isLoginSubmitted,
    },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: {
      errors: registerErrors,
      isValid: isRegisterValid,
      isSubmitted: isRegisterSubmitted,
    },
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const [login, { loading: loginLoading, error: loginError }] =
    useMutation<LoginResponse>(LOGIN_MUTATION);
  const [registerMutation, { loading: regLoading, error: regError }] =
    useMutation<RegisterResponse>(REGISTER_MUTATION);

  const onLogin = async (data: LoginFormData) => {
    try {
      const { data: response } = await login({ variables: data });

      if (response?.login.token && response?.login.user) {
        setAuth(response.login.user, response.login.token);
        navigate({ to: '/' });
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      const { data: response } = await registerMutation({
        variables: {
          email: data.email,
          password: data.password,
          name: data.name?.trim() || undefined,
        },
      });

      if (response?.register.token && response?.register.user) {
        setAuth(response.register.user, response.register.token);
        navigate({ to: '/' });
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    resetLogin();
    resetRegister();
  };

  const currentErrors = isRegister ? registerErrors : loginErrors;
  const apiError = isRegister ? regError : loginError;
  const isLoading = loginLoading || regLoading;

  const isInvalid = isRegister
    ? isRegisterSubmitted && !isRegisterValid
    : isLoginSubmitted && !isLoginValid;

  const onSubmit = isRegister
    ? handleSubmitRegister(onRegister)
    : handleSubmitLogin(onLogin);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{isRegister ? 'Create Account' : 'Welcome to ByteFood'}</h2>

        {apiError && <p className={styles.error}>{apiError.message}</p>}

        <form onSubmit={onSubmit} className={styles.form}>
          {isRegister && (
            <div className={styles.formField}>
              <input
                type="text"
                placeholder="Full Name"
                {...registerRegister('name')}
                disabled={isLoading}
                className={registerErrors.name ? styles.inputError : ''}
                data-testid="name-input"
              />
              <span className={styles.fieldError}>
                {registerErrors.name?.message || ''}
              </span>
            </div>
          )}

          <div className={styles.formField}>
            <input
              type="email"
              placeholder="Email"
              {...(isRegister
                ? registerRegister('email')
                : registerLogin('email'))}
              disabled={isLoading}
              className={currentErrors.email ? styles.inputError : ''}
              data-testid="email-input"
            />
            <span className={styles.fieldError}>
              {currentErrors.email?.message || ''}
            </span>
          </div>

          <div className={styles.formField}>
            <input
              type="password"
              placeholder="Password"
              {...(isRegister
                ? registerRegister('password')
                : registerLogin('password'))}
              disabled={isLoading}
              className={currentErrors.password ? styles.inputError : ''}
              data-testid="password-input"
            />
            <span className={styles.fieldError}>
              {currentErrors.password?.message || ''}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || isInvalid}
            className={styles.submitBtn}
          >
            {isLoading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className={styles.toggleAuth}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={handleToggleMode} className={styles.btnLink} type="button" data-testid="login-submit">
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <div className={styles.divider}>
          <span className={styles.dividerSpan}>OR</span>
        </div>

        <LoginWithGoogle />
      </div>
    </div>
  );
};
