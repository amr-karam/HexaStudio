import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/odoo/team/[id]/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

describe('GET /api/odoo/team/:id', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches a single team member by ID', async () => {
    const mockMember = {
      id: 7,
      name: 'John Doe',
      email: 'john@hexastudio.net',
      jobTitle: 'Senior Architect',
      hexa_role: 'Architect',
      hexa_department: 'Design',
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockMember), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/team/7');
    const response = await GET(request, { params: Promise.resolve({ id: '7' }) });

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/odoo/team/7`);
    expect(await response.json()).toEqual(mockMember);
  });

  it('forwards Authorization header', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'Test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = new NextRequest('http://localhost/api/odoo/team/1', {
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

    const request = new NextRequest('http://localhost/api/odoo/team/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: 'Failed to fetch team member' });
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Connection refused'));

    const request = new NextRequest('http://localhost/api/odoo/team/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: 'Internal server error' });
  });
});
