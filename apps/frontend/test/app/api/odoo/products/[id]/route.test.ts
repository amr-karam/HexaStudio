import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
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
      id: 456,
      name: 'Laptop Pro',
      default_code: 'PRD-001',
      list_price: 1299.99,
      type: 'product',
      is_active: true,
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockProduct), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/products/456');
    const response = await GET(request, { params: Promise.resolve({ id: '456' }) });

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/odoo/products/456`);
    expect(await response.json()).toEqual(mockProduct);
  });

  it('returns 404 when product not found', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/products/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: 'Product not found' });
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/odoo/products/123');
    const response = await GET(request, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Unknown error' });
  });
});
