import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/odoo/products/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/products/:id', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single product by ID', async () => {
    const mockProduct = {
      id: 42,
      name: 'Villa Dusk Floor Plan',
      list_price: 15000,
      categ_id: [1, 'Interior Design'],
      type: 'service',
      active: true,
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockProduct), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new Request('http://localhost/api/odoo/products/42');
    const response = await GET(request, { params: Promise.resolve({ id: '42' }) });

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/odoo/products/42`);
    expect(await response.json()).toEqual(mockProduct);
  });

  it('forwards Authorization header', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'Test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new Request('http://localhost/api/odoo/products/1', {
      headers: { Authorization: 'Bearer test-token' },
    });
    await GET(request, { params: Promise.resolve({ id: '1' }) });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' });
  });

  it('returns 404 when backend returns 404', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new Request('http://localhost/api/odoo/products/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: 'Product not found' });
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Connection refused'));

    const request = new Request('http://localhost/api/odoo/products/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Unknown error' });
  });
});
