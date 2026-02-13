import { test, expect } from '@playwright/test';
import { login, UI } from './helpers/auth';

test.describe('Foods main flow', () => {
  
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await login(page);
  });

  test('user can select a food, add it, and see it in daily consumed list', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: UI.dashboardHeading })).toBeVisible();

    const foodSelect = page.getByRole('combobox', { name: /Select a food/i });
    const options = page.getByTestId('food-select').locator('option');

    await expect.poll(async () => await options.count()).toBeGreaterThan(1);

    const foodName = (await options.nth(1).textContent())?.trim() ?? '';
    await foodSelect.selectOption({ index: 1 });

    await expect(page.getByRole('heading', { name: foodName, level: 3 })).toBeVisible({ timeout: 10000 });
    const addBtn = page.getByRole('button', { name: 'Add' });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    const consumedSection = page.getByTestId('daily-consumed-foods');
    await expect(consumedSection).toContainText(foodName);
    await expect(consumedSection).toContainText('100 g');
  });
});