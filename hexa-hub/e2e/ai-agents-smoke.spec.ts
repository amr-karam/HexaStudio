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

async function apiStreamChat(page: Page, token: string, body: Record<string, unknown>) {
  return page.request.fetch(`${API_URL}/ai/agents/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

test.describe('AI Agents smoke', () => {
  for (const role of ['super_admin', 'employee', 'client'] as Role[]) {
    test(`agent list and chat are accessible for ${role}`, async ({ page }) => {
      const token = await apiLogin(page, USERS[role], PASSWORD);
      expect(typeof token).toBe('string');

      const list = await apiGet(page, token, '/ai/agents/list');
      expect(list.ok()).toBeTruthy();
      const listJson = await list.json();
      expect(Array.isArray(listJson?.agents)).toBeTruthy();

      const chat = await apiPost(page, token, '/ai/agents/chat', {
        query: 'Hello from AI smoke test',
        agentName: 'knowledge-agent',
        stream: false,
      });
      expect(chat.ok()).toBeTruthy();
      const chatJson = await chat.json();
      expect(chatJson?.response?.length).toBeGreaterThan(0);
    });

    test(`AI stream endpoint returns SSE events for ${role}`, async ({ page }) => {
      const token = await apiLogin(page, USERS[role], PASSWORD);

      const stream = await apiStreamChat(page, token, {
        query: 'Stream hello from AI smoke test',
        agentName: 'erp-analyst',
        stream: true,
      });

      expect(stream.ok()).toBeTruthy();
      const text = await stream.text();
      expect(text.length).toBeGreaterThan(0);
      expect(text).toMatch(/agent\.start|message\.chunk|agent\.end|error/);
    });
  }

  test('client can read agent metadata but can exercise same chat surface', async ({ page }) => {
    const token = await apiLogin(page, USERS.client, PASSWORD);

    const list = await apiGet(page, token, '/ai/agents/list');
    expect(list.ok()).toBeTruthy();

    const chat = await apiPost(page, token, '/ai/agents/chat', {
      query: 'Client smoke query',
      stream: false,
    });
    expect(chat.ok()).toBeTruthy();
  });
});
