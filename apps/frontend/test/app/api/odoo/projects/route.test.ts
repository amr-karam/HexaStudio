import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, GET_BY_ID } from '@/app/api/odoo/projects/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function getRequestWithQuery(params: Record<string, string | null>): NextRequest {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null) searchParams.append(key, value);
  });
  return new NextRequest(`http://localhost/api/odoo/projects?${searchParams.toString()}`);
}

function postRequest(body: unknown = {}): NextRequest {
  return new NextRequest('http://localhost/api/odoo/projects', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('GET /api/odoo/projects', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches projects with pagination params', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ projects: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ limit: '10', offset: '20' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/projects?limit=10&offset=20`);
    expect(await response.json()).toEqual({ projects: [], total: 0 });
  });

  it('fetches projects with search parameter', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ projects: [], total: 5 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(getRequestWithQuery({ search: 'villa' }));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/projects?search=villa`);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await GET(getRequestWithQuery({}));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});

describe('GET /api/odoo/projects/[id]', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single project by id', async () => {
    const projectId = 'proj-123';
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: projectId, name: 'Test Project' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET_BY_ID(
      new NextRequest(`http://localhost/api/odoo/projects/${projectId}`),
      { params: Promise.resolve({ id: projectId }) }
    );

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/projects/${projectId}`);
    expect(await response.json()).toEqual({ id: projectId, name: 'Test Project' });
  });

  it('returns 404 when project not found', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await GET_BY_ID(
      new NextRequest('http://localhost/api/odoo/projects/nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );

    expect(response.status).toBe(404);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('down'));

    const response = await GET_BY_ID(
      new NextRequest('http://localhost/api/odoo/projects/123'),
      { params: Promise.resolve({ id: '123' }) }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});