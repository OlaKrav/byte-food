import { type Page } from '@playwright/test';

export const UI = {
  emailPlaceholder: 'Email',
  passPlaceholder: 'Password',
  signInBtn: 'Sign In',
  signUpBtn: 'Sign Up',
  signOutBtn: 'Sign Out',
  toggleSignUp: 'Sign up', 
  dashboardHeading: 'Byte Food',
  welcomeHeading: /Welcome to ByteFood/i,
  errorInvalid: /Invalid email or password/i,
  errorShortPass: /at least 8 characters/i,
};

const mockUser = {
  email: process.env.E2E_TEST_EMAIL || '',
  password: process.env.E2E_TEST_PASSWORD || '',
};

export async function login(
  page: Page,
  email = mockUser.email,
  password = mockUser.password,
) {
  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set');
  }

  await page.goto('/auth');
  await page.getByPlaceholder(UI.emailPlaceholder).fill(email);
  await page.getByPlaceholder(UI.passPlaceholder).fill(password);
  await page.getByRole('button', { name: UI.signInBtn, exact: true }).click();
}