import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/projects',
  '/blog',
  '/contact',
  '/ai',
  '/studio',
  '/privacy',
  '/terms',
  '/portal/login',
  '/portal',
  '/portal/settings',
  '/admin/accounting',
  '/admin/requests',
  '/dashboard/integrations',
  '/dashboard/odoo',
  '/dashboard/translations',
  '/xr-viewer',
];

test.describe('HEXA Studio Route Smoke & Availability Suite', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`route ${route} loads successfully`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
    });
  }
});
