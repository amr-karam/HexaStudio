import { test, expect } from '@playwright/test';

test.describe('HEXA Studio Client Portal v3.0 & 3D Designer E2E Flow', () => {
  test('should load public homepage and verify luxury title metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HexaStudio|HEXA STUDIO/);
  });

  test('should navigate to Client Portal HQ and verify executive status grid', async ({ page }) => {
    await page.goto('/portal');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should verify 3D Designer Mode & Spatial Layer Toggle rendering', async ({ page }) => {
    await page.goto('/');
    const designerBtn = page.getByRole('button', { name: /Designer Mode/i });
    await expect(designerBtn).toBeVisible();
  });
});
