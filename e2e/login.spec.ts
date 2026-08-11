import { test, expect } from '@playwright/test';

test.describe('Login & Dashboard E2E Tests', () => {
  test('redirects unauthenticated users from root / to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Trilho' })).toBeVisible();
  });

  test('allows logging in with valid admin credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@trilho.online');
    await page.fill('input[type="password"]', 'password123');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for URL transition to /dashboard or /board
    await page.waitForURL(/\/dashboard|\/board/, { timeout: 15000 });
    await expect(page.locator('body')).not.toContainText('Sign In');
  });
});
