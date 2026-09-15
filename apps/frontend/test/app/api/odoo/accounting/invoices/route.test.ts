import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/accounting/invoices/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function getRequestWithQuery(params: Record<string, string | null>): NextRequest {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null) searchParams.append(key, value);
  });
  return new NextRequest(`http://localhost/api/odoo/accounting/invoices?${searchParams.toString()}`);
}

describe('GET /api/odoo/accounting/invoices', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches invoices with default pagination', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ invoices: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({}));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/accounting/invoices`);
    expect(await response.json()).toEqual({ invoices: [], total: 0 });
  });

  it('fetches invoices with status filter', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ invoices: [], total: 2 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ status: 'paid' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/accounting/invoices?status=paid`);
  });

  it('fetches invoices with date range filter', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ invoices: [], total: 5 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ dateFrom: '2024-01-01', dateTo: '2024-12-31' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('dateFrom=2024-01-01');
    expect(url).toContain('dateTo=2024-12-31');
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await GET(getRequestWithQuery({}));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});