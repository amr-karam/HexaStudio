import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/projects/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/projects/:id', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single project by ID', async () => {
    const mockProject = {
      id: 42,
      name: 'Villa Dusk',
      hexa_deliverables_count: 5,
      hexa_last_deliverable_at: '2024-01-15T10:00:00Z',
      hexa_public_strapi_id: 'abc123',
      hexa_team_member_ids: [1, 2],
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockProject), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/projects/42');
    const response = await GET(request, { params: Promise.resolve({ id: '42' }) });

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/projects/42`);
    expect(await response.json()).toEqual(mockProject);
  });

  it('forwards Authorization header', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'Test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/projects/1', {
      headers: { Authorization: 'Bearer test-token' },
    });
    await GET(request, { params: Promise.resolve({ id: '1' }) });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' });
  });

  it('returns error status when backend returns non-OK', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/projects/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: 'Failed to fetch project' });
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Connection refused'));

    const request = new NextRequest('http://localhost/api/odoo/projects/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});
