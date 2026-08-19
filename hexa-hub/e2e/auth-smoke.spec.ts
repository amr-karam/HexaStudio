import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';
const API_URL = process.env.HEXA_HUB_API_URL || 'http://localhost:3000/api';
const PASSWORD = process.env.HEXA_HUB_SEED_PASSWORD || 'Test!2345';

const USERS = {
  super_admin: 'admin@hexastudio.net',
  employee: 'employee@hexastudio.net',
  client: 'client@hexastudio.net',
} as const;

type Role = keyof typeof USERS;

async function apiLogin(page: Page, email: string, password: string) {
  const res = await page.request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body?.access_token || body?.token || body?.accessToken;
}

async function apiGet(page: Page, token: string, path: string) {
  return page.request.get(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function apiPost(page: Page, token: string, path: string, data: unknown) {
  return page.request.post(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data,
  });
}

async function ensureLoggedIn(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
}

test.describe('Auth + RBAC smoke', () => {
  for (const role of ['super_admin', 'employee', 'client'] as Role[]) {
    test(`login + auth/me works for ${role}`, async ({ page }) => {
      await ensureLoggedIn(page);
      const token = await apiLogin(page, USERS[role], PASSWORD);
      expect(typeof token).toBe('string');

      const me = await apiGet(page, token, '/auth/me');
      expect(me.ok()).toBeTruthy();
    });

    test(`projects read works for ${role}`, async ({ page }) => {
      const token = await apiLogin(page, USERS[role], PASSWORD);
      const res = await apiGet(page, token, '/projects');
      expect(res.ok()).toBeTruthy();
    });
  }

  test('client cannot create project', async ({ page }) => {
    const token = await apiLogin(page, USERS.client, PASSWORD);
    const res = await apiPost(page, token, '/projects', { name: 'Client RBAC Smoke Project' });
    expect(res.status()).toBe(403);
  });
});
