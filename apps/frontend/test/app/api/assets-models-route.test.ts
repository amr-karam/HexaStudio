import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/assets/models/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/assets/models', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies the asset catalogue with the upstream status', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: true, count: 5, models: [{ id: 'ramadan-lantern-brass' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const response = await GET(new NextRequest('http://localhost/api/assets/models'));

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/assets/models`);
    expect(init.method).toBe('GET');
    expect(await response.json()).toMatchObject({ success: true, count: 5 });
  });

  it('returns 500 with success:false when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await GET(new NextRequest('http://localhost/api/assets/models'));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false });
  });
});
