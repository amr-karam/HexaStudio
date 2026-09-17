import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/accounting/invoices/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/accounting/invoices/[id]', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single invoice by id', async () => {
    const invoiceId = 'inv-101';
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: invoiceId, number: 'INV/2024/001', amount: 12500, state: 'posted', payment_state: 'paid' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(
      new NextRequest(`http://localhost/api/odoo/accounting/invoices/${invoiceId}`),
      { params: Promise.resolve({ id: invoiceId }) }
    );

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/accounting/invoices/${invoiceId}`);
    expect(await response.json()).toEqual({ id: invoiceId, number: 'INV/2024/001', amount: 12500, state: 'posted', payment_state: 'paid' });
  });

  it('returns 404 when invoice not found', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/accounting/invoices/nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('down'));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/accounting/invoices/123'),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});