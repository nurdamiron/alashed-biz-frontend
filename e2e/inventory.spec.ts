import { test, expect } from '@playwright/test';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
  });

  test('should navigate to inventory from bottom nav', async ({ page }) => {
    // Click inventory icon in bottom nav
    await page.locator('nav button').nth(3).click(); // Stock is 4th item

    await expect(page).toHaveURL(/.*inventory/);
    await expect(page.getByText('СКЛАД')).toBeVisible();
  });

  test('should display inventory header correctly', async ({ page }) => {
    await page.goto('/#/inventory');

    await expect(page.getByText('Складской хаб')).toBeVisible();
    await expect(page.getByText('СКЛАД')).toBeVisible();
    await expect(page.getByPlaceholder(/поиск/i)).toBeVisible();
  });

  test('should display category filters', async ({ page }) => {
    await page.goto('/#/inventory');

    // Check category buttons
    await expect(page.getByRole('button', { name: /все/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /наборы/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /контроллеры/i })).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/#/inventory');

    // Click on "Наборы" category
    await page.getByRole('button', { name: /наборы/i }).click();

    // Category should be active (has primary background)
    const naboryButton = page.getByRole('button', { name: /наборы/i });
    await expect(naboryButton).toHaveClass(/bg-primary/);
  });

  test('should search products', async ({ page }) => {
    await page.goto('/#/inventory');

    // Type in search
    await page.getByPlaceholder(/поиск/i).fill('arduino');

    // Wait for filter to apply
    await page.waitForTimeout(300);
  });

  test('should toggle low stock filter', async ({ page }) => {
    await page.goto('/#/inventory');

    // Click low stock filter
    await page.getByRole('button', { name: /дефицит/i }).click();

    // Button should be active
    const deficitButton = page.getByRole('button', { name: /дефицит/i });
    await expect(deficitButton).toHaveClass(/bg-red-500/);
  });

  test('should open create product modal', async ({ page }) => {
    await page.goto('/#/inventory');

    // Click FAB
    await page.locator('button').filter({ has: page.locator('[class*="add_box"]') }).click();

    await expect(page).toHaveURL(/.*inventory\/new/);
  });

  test('should navigate to product detail', async ({ page }) => {
    await page.goto('/#/inventory');

    // Wait for products to load
    await page.waitForTimeout(1000);

    // Click on first product card (if exists)
    const productCards = page.locator('[class*="rounded-"][class*="shadow"]').filter({ hasText: /цена продажи/i });
    const count = await productCards.count();

    if (count > 0) {
      await productCards.first().click();
      await expect(page).toHaveURL(/.*inventory\/\d+/);
    }
  });

  test('should have QR scanner button', async ({ page }) => {
    await page.goto('/#/inventory');

    // QR scanner button should be visible
    const qrButton = page.locator('button').filter({ has: page.locator('[class*="qr_code"]') });
    await expect(qrButton).toBeVisible();
  });
});

test.describe('Inventory - Create Product', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
  });

  test('should display create product form', async ({ page }) => {
    await page.goto('/#/inventory/new');

    // Check form elements
    await expect(page.getByText(/новый товар|добавить товар/i)).toBeVisible();
  });

  test('should navigate back from create product', async ({ page }) => {
    await page.goto('/#/inventory/new');

    // Click back/close button
    await page.locator('button').filter({ has: page.locator('[class*="close"], [class*="arrow_back"]') }).first().click();

    // Should navigate back
    await expect(page).not.toHaveURL(/.*inventory\/new/);
  });
});
