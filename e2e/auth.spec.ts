import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/#/login');

    // Check form elements exist
    await expect(page.getByPlaceholder('admin')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /войти/i })).toBeVisible();

    // Check demo credentials section
    await expect(page.getByText('Демо доступ')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/#/login');

    await page.getByPlaceholder('admin').fill('wronguser');
    await page.getByPlaceholder('••••••••').fill('wrongpass');
    await page.getByRole('button', { name: /войти/i }).click();

    // Wait for error message
    await expect(page.getByText(/неверный|ошибка/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/#/login');

    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
    await expect(page.getByText('Общая выручка')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/#/login');

    const passwordInput = page.getByPlaceholder('••••••••');
    await passwordInput.fill('testpassword');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click visibility toggle - button is inside password field's relative div
    const passwordContainer = passwordInput.locator('..');
    const visibilityButton = passwordContainer.locator('button');
    await visibilityButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/#/login');

    // Theme button is in top-right corner with absolute positioning
    // It contains an Icon with light_mode or dark_mode
    const themeButton = page.locator('button.absolute').first();

    // Get initial background color
    const initialBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    await themeButton.click();
    await page.waitForTimeout(500); // Wait for theme transition

    // Background should change
    const newBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    expect(initialBg).not.toBe(newBg);
  });

  test('should have accessible login button', async ({ page }) => {
    await page.goto('/#/login');

    const loginButton = page.getByRole('button', { name: /войти/i });

    // Button should be disabled when fields are empty
    await expect(loginButton).toBeDisabled();

    // Fill fields
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');

    // Button should be enabled
    await expect(loginButton).toBeEnabled();
  });
});

test.describe('Authentication - Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Navigate to settings
    await page.goto('/#/settings');

    // Click logout button
    await page.getByRole('button', { name: /выйти|logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
