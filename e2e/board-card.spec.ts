import { test, expect, Page } from '@playwright/test';

test.describe('Board & Card Operations E2E Tests', () => {
  test.setTimeout(60000);

  /**
   * Helper function to log in and ensure the browser is on an active board page with header rendered.
   */
  async function loginAndGoToBoard(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@trilho.online');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for login redirect
    await page.waitForURL(/\/dashboard|\/board/, { timeout: 25000 });

    // If on /dashboard, wait for automatic redirect to /board/[id] or handle zero-board state
    if (page.url().includes('/dashboard')) {
      try {
        await page.waitForURL(/\/board\//, { timeout: 15000 });
      } catch {
        const createBtn = page.locator('button:has-text("Create New Board")');
        if (await createBtn.isVisible()) {
          await createBtn.click();
          await page.fill('input[placeholder*="Trilho Mobile App"]', 'Initial E2E Board');
          await page.click('button[type="submit"]:has-text("Create Board")');
          await page.waitForURL(/\/board\//, { timeout: 15000 });
        }
      }
    }

    // Ensure header title is rendered
    await page.waitForSelector('header h2', { timeout: 20000 });
  }

  test('create boards', async ({ page }) => {
    await loginAndGoToBoard(page);

    // Open Create Board Modal
    const createBoardBtn = page.locator('button[title="Create New Board"], button:has-text("Create New Board")').first();
    await createBoardBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBoardBtn.click();

    // Fill Create Board Modal
    await page.waitForSelector('input[placeholder*="Trilho Mobile App"]', { timeout: 10000 });
    const boardTitle = `Board E2E ${Date.now()}`;
    await page.fill('input[placeholder*="Trilho Mobile App"]', boardTitle);
    await page.fill('textarea[placeholder*="Describe the main goal"]', 'Descrição do novo quadro E2E');
    await page.click('button[type="submit"]:has-text("Create Board")');

    // Verify header title updates to new board
    const headerTitle = page.locator('header h2');
    await expect(headerTitle).toContainText(boardTitle, { timeout: 15000 });
  });

  test('edit boards', async ({ page }) => {
    await loginAndGoToBoard(page);

    const headerTitle = page.locator('header h2');
    await headerTitle.waitFor({ state: 'visible', timeout: 10000 });

    const editedTitle = `Board Editado ${Date.now()}`;
    await headerTitle.click();

    const headerInput = page.locator('header input.bg-slate-800');
    await headerInput.waitFor({ state: 'visible', timeout: 5000 });
    await headerInput.fill(editedTitle);
    await page.keyboard.press('Enter');

    // Verify board title updated in Navbar header
    await expect(headerTitle).toContainText(editedTitle, { timeout: 10000 });
  });

  test('create cards', async ({ page }) => {
    await loginAndGoToBoard(page);

    const firstColumn = page.locator('div.w-60').first();
    await firstColumn.waitFor({ state: 'visible', timeout: 15000 });

    const addCardBtn = firstColumn.locator('button:has-text("Add Card")');
    await addCardBtn.click();

    const cardTitleInput = firstColumn.locator('input[placeholder="Card title..."]');
    await cardTitleInput.waitFor({ state: 'visible', timeout: 5000 });

    const cardTitle = `Nova Tarefa ${Date.now()}`;
    await cardTitleInput.fill(cardTitle);

    const submitCardBtn = firstColumn.locator('button[type="submit"]:has-text("Add Card")');
    await submitCardBtn.click();

    // Verify card appears in Column 1
    const cardElement = firstColumn.locator(`h4:has-text("${cardTitle}")`).first();
    await expect(cardElement).toBeVisible({ timeout: 10000 });
  });

  test('edit cards', async ({ page }) => {
    await loginAndGoToBoard(page);

    const firstColumn = page.locator('div.w-60').first();
    await firstColumn.waitFor({ state: 'visible', timeout: 15000 });

    // Ensure at least one card exists in column 1
    let cardHeader = firstColumn.locator('h4').first();
    if (!(await cardHeader.isVisible())) {
      await firstColumn.locator('button:has-text("Add Card")').click();
      const input = firstColumn.locator('input[placeholder="Card title..."]');
      await input.fill('Card Temporario E2E');
      await firstColumn.locator('button[type="submit"]:has-text("Add Card")').click();
      cardHeader = firstColumn.locator('h4:has-text("Card Temporario E2E")');
      await expect(cardHeader).toBeVisible({ timeout: 10000 });
    }

    // Click card to open detail modal
    await cardHeader.click();

    const modalTitleInput = page.locator('input[placeholder="Card Title..."]');
    await modalTitleInput.waitFor({ state: 'visible', timeout: 10000 });

    const updatedTitle = `Card Editado ${Date.now()}`;
    const updatedDesc = 'Descrição atualizada pelo teste E2E';

    await modalTitleInput.fill(updatedTitle);

    const modalDescTextarea = page.locator('textarea[placeholder="Add a detailed description..."]');
    await modalDescTextarea.fill(updatedDesc);

    // Save & Close changes
    const saveAndCloseBtn = page.locator('button[title="Save & Close"]');
    await saveAndCloseBtn.click();
    await page.waitForTimeout(500);

    // Verify updated title is rendered on the board
    const updatedCardHeader = firstColumn.locator(`h4:has-text("${updatedTitle}")`);
    await expect(updatedCardHeader).toBeVisible({ timeout: 10000 });
  });
});
