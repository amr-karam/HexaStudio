import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/portal/reports/executive-brief/route';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

import { API_BASE_URL } from '@/config/constants';

function makeRequest(query: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`http://localhost/api/portal/reports/executive-brief${query}`, {
    headers,
  });
}

describe('GET /api/portal/reports/executive-brief', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects a request without projectId', async () => {
    const response = await GET(makeRequest(''));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards the auth cookie to the upstream backend', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ brief: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(
      makeRequest('?projectId=p1', { cookie: 'auth_token=jwt-secret-value' }),
    );

    expect(response.status).toBe(200);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      `${API_BASE_URL}/api/v1/portal/reports/executive-brief?projectId=p1`,
    );
    expect((init.headers as Record<string, string>).Cookie).toBe(
      'auth_token=jwt-secret-value',
    );
  });

  it('forwards the Bearer authorization header when no cookie is present', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ brief: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(
      makeRequest('?projectId=p1', { authorization: 'Bearer tok' }),
    );

    expect(response.status).toBe(200);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('passes through an upstream 401 as an honest 401', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(makeRequest('?projectId=p1'));

    expect(response.status).toBe(401);
  });

  it('returns 502 when the upstream is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const response = await GET(makeRequest('?projectId=p1'));

    expect(response.status).toBe(502);
  });
});
