import { test, expect } from '@playwright/test';
import { login, UI } from './helpers/auth';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('auth page shows welcome heading and redirects guest', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByRole('heading', { name: UI.welcomeHeading })).toBeVisible();
  });

  test('authenticated user flow: login and logout', async ({ page }) => {
    await login(page);

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: UI.dashboardHeading })).toBeVisible();

    await page.getByRole('button', { name: UI.signOutBtn }).click();
    await expect(page).toHaveURL(/\/auth/);
  });

  test('user can register successfully', async ({ page }) => {
    const uniqueEmail = `e2e-reg-${Date.now()}@test.bytefood.local`;
    
    await page.getByRole('button', { name: UI.toggleSignUp }).click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByPlaceholder(/name/i).fill('Test User');
    await page.getByPlaceholder(UI.emailPlaceholder).fill(uniqueEmail);
    await page.getByPlaceholder(UI.passPlaceholder).fill('E2eTestPass1');
    await page.getByRole('button', { name: UI.signUpBtn }).click();

    await expect(page).toHaveURL('/');
  });

  test('shows Google auth option', async ({ page }) => {
    const googleWrapper = page.locator('.google-btn-wrapper');
    await expect(googleWrapper).toBeVisible();
    
    await expect(googleWrapper).not.toBeEmpty();
  });

  test('validation: wrong password', async ({ page }) => {
    await login(page, 'wrong-login@example.com', 'WrongPass123');
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText(UI.errorInvalid)).toBeVisible();
  });

  test('validation: short password on register', async ({ page }) => {
    await page.getByRole('button', { name: UI.toggleSignUp }).click();
    await page.getByPlaceholder(/name/i).fill('Test User');
    await page.getByPlaceholder(UI.emailPlaceholder).fill('newuser@example.com');
    await page.getByPlaceholder(UI.passPlaceholder).fill('short');
    await page.getByRole('button', { name: UI.signUpBtn }).click();

    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText(UI.errorShortPass)).toBeVisible();
  });
});