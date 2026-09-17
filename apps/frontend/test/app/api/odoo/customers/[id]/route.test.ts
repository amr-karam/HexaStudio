import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/customers/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.VITE_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/customers/:id', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single customer by ID', async () => {
    const mockCustomer = {
      id: 123,
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '+1 (555) 123-4567',
      company_name: 'Acme Corp',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94105',
      country: 'US',
      website: 'https://acme.com',
      is_active: true,
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockCustomer), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/customers/123');
    const response = await GET(request, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/odoo/customers/123`);
    expect(await response.json()).toEqual(mockCustomer);
  });

  it('returns 404 when customer not found', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/customers/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: 'Customer not found' });
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/odoo/customers/123');
    const response = await GET(request, { params: Promise.resolve({ id: '123' }) });

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Unknown error' });
  });
});