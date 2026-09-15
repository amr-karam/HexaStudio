import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/crm/leads/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function getRequestWithQuery(params: Record<string, string | null>): NextRequest {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null) searchParams.append(key, value);
  });
  return new NextRequest(`http://localhost/api/odoo/crm/leads?${searchParams.toString()}`);
}

describe('GET /api/odoo/crm/leads', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches leads with pagination params', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ leads: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ limit: '10', offset: '20' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/crm/leads?limit=10&offset=20`);
    expect(await response.json()).toEqual({ leads: [], total: 0 });
  });

  it('fetches leads with search parameter', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ leads: [], total: 3 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ search: 'acme' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/crm/leads?search=acme`);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await GET(getRequestWithQuery({}));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});