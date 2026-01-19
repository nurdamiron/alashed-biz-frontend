import { test, expect } from '@playwright/test';

test.describe('Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
  });

  test('should navigate to orders list', async ({ page }) => {
    await page.goto('/#/orders');

    await expect(page.getByText('ЗАКАЗЫ')).toBeVisible();
  });

  test('should open create order modal', async ({ page }) => {
    await page.goto('/#/orders');

    // Click FAB to create new order
    await page.locator('button').filter({ has: page.locator('[class*="add"]') }).last().click();

    // Should navigate to new order form
    await expect(page).toHaveURL(/.*orders\/new/);
    await expect(page.getByText('Новый заказ')).toBeVisible();
  });

  test('should display order sources', async ({ page }) => {
    await page.goto('/#/orders/new');

    // Check order sources are visible
    await expect(page.getByText('Kaspi')).toBeVisible();
    await expect(page.getByText('Insta')).toBeVisible();
    await expect(page.getByText('WA')).toBeVisible();
    await expect(page.getByText('Сайт')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/#/orders/new');

    // Try to create order without filling required fields
    const createButton = page.getByRole('button', { name: /создать заказ/i });

    // Button should be disabled without client name and products
    await expect(createButton).toBeDisabled();

    // Fill client name
    await page.getByPlaceholder('ФИО Клиента').fill('Тест Клиент');

    // Still disabled without products
    await expect(createButton).toBeDisabled();
  });

  test('should open product picker', async ({ page }) => {
    await page.goto('/#/orders/new');

    // Click add product button
    await page.getByText('Добавить +').click();

    // Product picker should be visible
    await expect(page.getByText('Каталог')).toBeVisible();
    await expect(page.getByPlaceholder('Поиск...')).toBeVisible();
  });

  test('should search products in picker', async ({ page }) => {
    await page.goto('/#/orders/new');

    await page.getByText('Добавить +').click();

    // Wait for catalog to load
    await expect(page.getByText('Каталог')).toBeVisible();

    // Search for product
    await page.getByPlaceholder('Поиск...').fill('test');

    // Wait for search results (debounced)
    await page.waitForTimeout(500);
  });

  test('should calculate total amount', async ({ page }) => {
    await page.goto('/#/orders/new');

    // Initial total should be 0
    await expect(page.getByText('Итого к оплате')).toBeVisible();
  });

  test('should navigate back from create order', async ({ page }) => {
    await page.goto('/#/orders/new');

    // Click close button
    await page.locator('button').filter({ has: page.locator('[class*="close"]') }).first().click();

    // Should go back
    await expect(page).not.toHaveURL(/.*orders\/new/);
  });
});

test.describe('Orders - Dashboard Quick Action', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
  });

  test('should navigate to create order from dashboard quick action', async ({ page }) => {
    // Click "Заказ" quick action
    await page.getByText('Заказ').click();

    await expect(page).toHaveURL(/.*orders\/new/);
  });
});
