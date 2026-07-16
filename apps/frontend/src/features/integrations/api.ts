'use client';

import { API_BASE_URL } from '@/config/constants';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  headers?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
  headers?: Record<string, string>;
}

const BASE = `${API_BASE_URL}/api/webhooks`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Webhook API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const webhookApi = {
  findAll: () => request<WebhookConfig[]>(''),
  findById: (id: string) => request<WebhookConfig>(`/${id}`),
  create: (dto: CreateWebhookDto) =>
    request<WebhookConfig>('', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: UpdateWebhookDto) =>
    request<WebhookConfig>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    request<void>(`/${id}`, { method: 'DELETE' }),
  toggle: (id: string) =>
    request<WebhookConfig>(`/${id}/toggle`, { method: 'PATCH' }),
};
