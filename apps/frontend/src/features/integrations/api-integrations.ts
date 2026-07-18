'use client';

import { API_BASE_URL } from '@/config/constants';

const BASE = `${API_BASE_URL}/api/integrations`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`Integration API error: ${res.status}`);
  return res.json();
}
