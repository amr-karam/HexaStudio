import { test, expect } from '@playwright/test';

test.describe('HEXA Studio Visual Regression Suite', () => {
  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Allow initial animations to settle
    await page.waitForTimeout(1000);
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('homepage.png', { threshold: 0.2 });
  });

  test('client portal login visual snapshot', async ({ page }) => {
    await page.goto('/portal/login', { waitUntil: 'domcontentloaded' });
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('portal-login.png', { threshold: 0.2 });
  });

  test('ai multimodal studio visual snapshot', async ({ page }) => {
    await page.goto('/portal/ai', { waitUntil: 'domcontentloaded' });
    expect(await page.screenshot({ fullPage: true }))
      .toMatchSnapshot('portal-ai.png', { threshold: 0.2 });
  });
});
