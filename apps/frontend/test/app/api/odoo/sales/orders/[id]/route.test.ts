import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/sales/orders/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/sales/orders/[id]', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single sales order by id', async () => {
    const orderId = 'so-789';
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: orderId, name: 'SO/2024/001', total: 15000, state: 'draft' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(
      new NextRequest(`http://localhost/api/odoo/sales/orders/${orderId}`),
      { params: Promise.resolve({ id: orderId }) }
    );

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/sales/orders/${orderId}`);
    expect(await response.json()).toEqual({ id: orderId, name: 'SO/2024/001', total: 15000, state: 'draft' });
  });

  it('returns 404 when sales order not found', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/sales/orders/nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('down'));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/sales/orders/123'),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});