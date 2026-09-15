import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/crm/leads/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/crm/leads/[id]', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single lead by id', async () => {
    const leadId = 'lead-456';
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: leadId, name: 'Acme Corp', email: 'contact@acme.com' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(
      new NextRequest(`http://localhost/api/odoo/crm/leads/${leadId}`),
      { params: Promise.resolve({ id: leadId }) }
    );

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/crm/leads/${leadId}`);
    expect(await response.json()).toEqual({ id: leadId, name: 'Acme Corp', email: 'contact@acme.com' });
  });

  it('returns 404 when lead not found', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/crm/leads/nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('down'));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/crm/leads/123'),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});