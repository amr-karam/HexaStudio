'use client';

import { API_BASE_URL } from '@/config/constants';

export interface LocaleEntry {
  id: number;
  title: string;
  slug?: string;
  fields: Record<string, unknown>;
  locale: string;
  localizations: Array<{ id: number; locale: string }>;
}

export interface TranslationExport {
  exportedAt: string;
  locale: string;
  contentTypes: Record<string, LocaleEntry[]>;
}

export interface ContentTypeStatus {
  total: number;
  translated: number;
}

export interface TranslationStatus {
  locale: string;
  total: number;
  translated: number;
  missing: number;
  contentTypes: Record<string, ContentTypeStatus>;
}

const BASE = `${API_BASE_URL}/api/translations`;

export const translationApi = {
  exportLocale: async (locale: string): Promise<TranslationExport> => {
    const res = await fetch(`${BASE}/export/${locale}`);
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return res.json();
  },

  importLocale: async (locale: string, data: TranslationExport): Promise<{ updated: number }> => {
    const res = await fetch(`${BASE}/import/${locale}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Import failed: ${res.status}`);
    return res.json();
  },

  getStatus: async (): Promise<TranslationStatus[]> => {
    const res = await fetch(`${BASE}/status`);
    if (!res.ok) throw new Error(`Status failed: ${res.status}`);
    return res.json();
  },
};
