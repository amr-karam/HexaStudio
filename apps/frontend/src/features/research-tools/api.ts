'use client';

import { API_BASE_URL } from '@/config/constants';

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface ScrapePageResult {
  content: string;
  metadata: { title: string; author?: string };
}

export interface SynthesizeReportResult {
  report_id: string;
  summary: string;
  citations: string[];
}

export interface ExportLuxuryPdfResult {
  success: boolean;
  pdfUrl: string;
  message: string;
}

export interface ApplyLiveMaterialResult {
  success: boolean;
  message: string;
}

export interface MaterialSpec {
  color: string;
  roughness: number;
  metalness: number;
  name: string;
}

const BASE = `${API_BASE_URL}/api/research`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Research API error: ${res.status} ${err}`);
  }
  return res.json();
}

export const researchToolsApi = {
  webSearch: (params: { query: string; limit?: number }) =>
    request<WebSearchResult[]>('/web-search', { body: JSON.stringify(params) }),

  scrapePage: (params: { url: string }) =>
    request<ScrapePageResult>('/scrape-page', { body: JSON.stringify(params) }),

  synthesizeReport: (params: { findings: string; focus: string }) =>
    request<SynthesizeReportResult>('/synthesize-report', { body: JSON.stringify(params) }),

  exportLuxuryPdf: (params: { reportId: string; projectName: string; findings: string }) =>
    request<ExportLuxuryPdfResult>('/export-luxury-pdf', { body: JSON.stringify(params) }),

  applyLiveMaterial: (params: { projectId: string; element: string; materialSpec: MaterialSpec }) =>
    request<ApplyLiveMaterialResult>('/apply-live-material', { body: JSON.stringify(params) }),
};
