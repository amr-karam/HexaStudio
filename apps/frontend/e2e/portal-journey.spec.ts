import { test, expect } from '@playwright/test';

test.describe('HEXA Client Portal v3.0 Journey', () => {
  test('navigates to Client Portal dashboard and verifies executive metrics', async ({ page }) => {
    await page.goto('/portal');
    await expect(page.locator('h1')).toContainText(/Horizon Villa|Dashboard|Client Portal/i);

    // Verify 5-second clarity grid cards exist
    await expect(page.getByText('Overall Progress')).toBeVisible();
    await expect(page.getByText('Pending Approvals')).toBeVisible();
    await expect(page.getByText('Project Health')).toBeVisible();
  });

  test('opens and interacts with Approval Center', async ({ page }) => {
    await page.goto('/portal/approvals');
    await expect(page.locator('h1')).toContainText('Approval Center');
    await expect(page.getByText('3D Exterior Renderings')).toBeVisible();
  });

  test('opens Document Center and filters file categories', async ({ page }) => {
    await page.goto('/portal/documents');
    await expect(page.locator('h1')).toContainText('Document Center');
    await page.click('button:has-text("design")');
    await expect(page.getByText('Horizon_Villa_3D_Exterior_Renderings_v2.pdf')).toBeVisible();
  });

  test('opens Finance & Invoicing center and converts currencies', async ({ page }) => {
    await page.goto('/portal/finance');
    await expect(page.locator('h1')).toContainText('Finance');
    await page.click('button:has-text("EUR")');
    await expect(page.getByText('Total Paid')).toBeVisible();
  });
});
