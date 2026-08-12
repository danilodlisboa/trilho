import { test, expect } from '@playwright/test';

test.describe('LGPD Privacy & Legal Pages E2E Workflows', () => {
  test('navigates and verifies public Privacy Policy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /Privacy Policy \(LGPD Compliance\)/i })).toBeVisible();
    await expect(page.getByText(/privacy@trilho\.online/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Login/i })).toBeVisible();
  });

  test('navigates and verifies public Terms of Service page', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Login/i })).toBeVisible();
  });

  test('registration page displays mandatory terms consent checkbox and links', async ({ page }) => {
    await page.goto('/register');
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    const termsLink = page.getByRole('link', { name: /Terms of Service/i });
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', '/terms');

    const privacyLink = page.getByRole('link', { name: /Privacy Policy/i });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
