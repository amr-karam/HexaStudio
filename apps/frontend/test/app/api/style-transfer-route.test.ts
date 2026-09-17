import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/style-transfer/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('POST /api/style-transfer', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies generation to the backend generate endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, imageUrl: 'base64img' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await POST(
      new NextRequest('http://localhost/api/style-transfer', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'sandstone', materialId: 'egyptian-granite' }),
      }),
    );

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/style-transfer/generate`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({ materialId: 'egyptian-granite' });
    expect(await response.json()).toMatchObject({ success: true });
  });

  it('passes an upstream failure status through honestly', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await POST(
      new NextRequest('http://localhost/api/style-transfer', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'x', materialId: 'y' }),
      }),
    );

    expect(response.status).toBe(502);
  });

  it('returns 500 with success:false when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await POST(
      new NextRequest('http://localhost/api/style-transfer', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'x', materialId: 'y' }),
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false });
  });
});

describe('GET /api/style-transfer', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies the materials list from the backend', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 'nile-lotus-wood' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(new NextRequest('http://localhost/api/style-transfer'));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/style-transfer/materials`);
    expect(await response.json()).toEqual([{ id: 'nile-lotus-wood' }]);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('down'));

    const response = await GET(new NextRequest('http://localhost/api/style-transfer'));

    expect(response.status).toBe(500);
  });
});
