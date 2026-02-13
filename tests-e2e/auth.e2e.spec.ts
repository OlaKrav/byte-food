import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const envE2ePath = path.resolve(process.cwd(), '.env.e2e');

if (existsSync(envE2ePath)) {
  const content = readFileSync(envE2ePath, 'utf8');
  
  content.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    const [key, ...valueParts] = trimmedLine.split('=');
    const rawValue = valueParts.join('=');

    if (key && rawValue !== undefined) {
      const cleanKey = key.trim();
      const cleanValue = rawValue.trim().replace(/^["']|["']$/g, '');
      
      process.env[cleanKey] = cleanValue;
    }
  });
}

const testUser = {
  email: process.env.E2E_TEST_EMAIL,
  password: process.env.E2E_TEST_PASSWORD,
};

test('auth page shows welcome heading', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByRole('heading', { name: /Welcome to ByteFood/i })).toBeVisible();
});

test('unauthenticated user visiting home is redirected to auth', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth/);
  await expect(page.getByRole('heading', { name: /Welcome to ByteFood/i })).toBeVisible();
});

test('authenticated user sees dashboard after login', async ({ page }) => {
  test.skip(!testUser.email || !testUser.password, 'E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set');

  await page.goto('/auth');

  await page.getByPlaceholder('Email').fill(testUser.email!);
  await page.getByPlaceholder('Password').fill(testUser.password!);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Byte Food' })).toBeVisible();
  await expect(page.getByText(/Track and analyze food composition/i)).toBeVisible();
  await expect(page.getByText('Daily Nutrients')).toBeVisible();
});
