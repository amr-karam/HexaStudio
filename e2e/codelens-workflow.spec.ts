import { test, expect } from '@playwright/test';

test.describe('Code Lens UI Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('File Selection - Drag and Drop', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('path/to/sample.js');
    await expect(page.locator('.file-selected')).toHaveText('sample.js');
  });

  test('Task Toggles - Individual and Combined', async ({ page }) => {
    await page.locator('.task-toggle').first().click();
    await page.locator('.task-toggle').nth(1).click();
    await expect(page.locator('.task-toggle:checked')).toHaveCount(2);
  });

  test('Analyze Button - Valid File + Tasks', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles('path/to/sample.js');
    await page.locator('.task-toggle').first().click();
    await page.locator('.analyze-button').click();
    await expect(page.locator('.results-panel')).toBeVisible();
  });

  test('Analyze Button - Disabled (No File or Tasks)', async ({ page }) => {
    await expect(page.locator('.analyze-button')).toBeDisabled();
  });

  test('Results Panel - Syntax Highlighting', async ({ page }) => {
    await page.locator('input[type=file]').setInputFiles('path/to/sample.js');
    await page.locator('.task-toggle').first().click();
    await page.locator('.analyze-button').click();
    await expect(page.locator('.syntax-highlight')).toBeVisible();
  });
});
