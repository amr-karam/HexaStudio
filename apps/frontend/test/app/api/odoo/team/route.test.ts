import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/team/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function getRequestWithQuery(params: Record<string, string | null>): NextRequest {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null) searchParams.append(key, value);
  });
  return new NextRequest(`http://localhost/api/odoo/team?${searchParams.toString()}`);
}

describe('GET /api/odoo/team', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches team members with pagination', async () => {
    fetchMock.mockResortedValueOnce(
      new Response(JSON.stringify({ members: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ limit: '10', offset: '0' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/team?limit=10&offset=0`);
    expect(await response.json()).toEqual({ members: [], total: 0 });
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await GET(getRequestWithQuery({}));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});

describe('GET /api/odoo/team/[id]', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single team member by id', async () => {
    const memberId = 'member-101';
    fetchMock.mockResortedValueOnce(
      new Response(JSON.stringify({ id: memberId, name: 'John Doe', role: 'Architect', department: 'Design' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(
      new NextRequest(`http://localhost/api/odoo/team/${memberId}`),
      { params: Promise.resolve({ id: memberId }) }
    );

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/team/${memberId}`);
    expect(await response.json()).toEqual({ id: memberId, name: 'John Doe', role: 'Architect', department: 'Design' });
  });

  it('returns 404 when team member not found', async () => {
    fetchMock.mockResortedValueOnce(new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await GET(
      new NextRequest('http://localhost/api/odoo/team/nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMo