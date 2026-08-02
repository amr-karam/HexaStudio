import { test, expect } from '@playwright/test';

test.describe('Code Lens UI Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('File Selection - Drag and Drop', async ({ page }) => {
    await page.locator('input[type=
file]').setInputFiles('path/to/sample.js');
    await expect(page.locator('.file-selected')).toHaveText('sample.js');
  });
});
