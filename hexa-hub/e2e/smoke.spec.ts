import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3001';
const PAGES = [
  '/',
  '/portal',
  '/dashboard',
  '/dashboard/projects',
  '/dashboard/contacts',
  '/dashboard/calendar',
  '/dashboard/approvals',
];

test.describe('HEXA Hub smoke', () => {
  for (const page of PAGES) {
    test(`renders ${page}`, async ({ page: p }) => {
      const res = await p.goto(`${BASE}${page}`);
      expect(res?.ok()).toBeTruthy();
    });
  }
});
