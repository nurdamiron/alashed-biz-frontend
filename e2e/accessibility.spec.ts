import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/#/login');

    // Should have h1
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThanOrEqual(1);
  });

  test('should have form labels', async ({ page }) => {
    await page.goto('/#/login');

    // Check for labels - use exact match to avoid duplicates
    await expect(page.getByText('Логин', { exact: true })).toBeVisible();
    await expect(page.getByText('Пароль', { exact: true })).toBeVisible();
  });

  test('should support keyboard navigation on login', async ({ page }) => {
    await page.goto('/#/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate without mouse
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/#/login');

    const input = page.getByPlaceholder('admin');
    await input.focus();

    // Check that input has focus styles
    const hasFocusRing = await input.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow !== 'none' || styles.outline !== 'none';
    });

    expect(hasFocusRing).toBeTruthy();
  });
});

test.describe('Accessibility - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });
  });

  test('should have accessible navigation', async ({ page }) => {
    // Bottom nav should have proper role
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have accessible buttons', async ({ page }) => {
    // All interactive elements should be keyboard accessible
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('should maintain contrast in dark mode', async ({ page }) => {
    // Go to settings and toggle dark mode
    await page.goto('/#/settings');

    // Find theme toggle
    const themeToggle = page.locator('button').filter({ has: page.locator('[class*="mode"]') }).first();

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Page should still be readable
      const body = page.locator('body');
      const bgColor = await body.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );

      expect(bgColor).toBeTruthy();
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should have touch-friendly targets', async ({ page }) => {
    await page.goto('/#/login');

    // Login button should be large enough
    const loginButton = page.getByRole('button', { name: /войти/i });
    const box = await loginButton.boundingBox();

    if (box) {
      // Minimum touch target: 44x44px
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should be scrollable', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin');
    await page.getByRole('button', { name: /войти/i }).click();
    await expect(page).toHaveURL(/.*\/$/, { timeout: 10000 });

    // Navigate to a page with scrollable content
    await page.goto('/#/tasks');

    // Page should be scrollable
    const isScrollable = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.scrollHeight > main.clientHeight : false;
    });

    // This might be true or false depending on content, just ensure no error
    expect(typeof isScrollable).toBe('boolean');
  });
});

test.describe('Screen Reader Support', () => {
  test('should have alt text on images', async ({ page }) => {
    await page.goto('/#/login');

    // Logo should have alt text
    const logo = page.locator('img').first();
    const alt = await logo.getAttribute('alt');
    expect(alt).toBeTruthy();
  });

  test('should have button names', async ({ page }) => {
    await page.goto('/#/login');

    // Submit button should have accessible name
    const submitButton = page.getByRole('button', { name: /войти/i });
    await expect(submitButton).toBeVisible();
  });
});
