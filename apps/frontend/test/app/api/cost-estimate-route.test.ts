import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/cost-estimate/route';

const fetchMock = vi.fn();
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/cost-estimate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/cost-estimate', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies a calculate action to the backend and passes the status through', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, summary: { totalCostEGP: 14500 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await POST(
      postRequest({ action: 'calculate', payload: { surfaceAreas: { 'egyptian-granite': 5 } } }),
    );

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/cost-estimate/calculate`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ surfaceAreas: { 'egyptian-granite': 5 } });
    expect(await response.json()).toMatchObject({ success: true });
  });

  it('streams the PDF bytes with pdf content-type for the pdf action', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    fetchMock.mockResolvedValueOnce(
      new Response(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="villa.pdf"',
        },
      }),
    );

    const response = await POST(
      postRequest({ action: 'pdf', payload: { surfaceAreas: {}, projectName: 'villa' } }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('villa.pdf');
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/cost-estimate/pdf`);
  });

  it('returns an honest error when PDF generation fails upstream', async () => {
    fetchMock.mockResolvedValueOnce(new Response('boom', { status: 500 }));

    const response = await POST(
      postRequest({ action: 'pdf', payload: { surfaceAreas: {} } }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'PDF generation failed' });
  });

  it('returns 500 with success:false when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const response = await POST(postRequest({ action: 'calculate', payload: {} }));

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ success: false });
  });
});

describe('GET /api/cost-estimate', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('proxies the materials catalogue from the backend', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 'egyptian-granite' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await GET(new NextRequest('http://localhost/api/cost-estimate'));

    expect(response.status).toBe(200);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BACKEND}/api/v1/cost-estimate/materials`);
    expect(await response.json()).toEqual([{ id: 'egyptian-granite' }]);
  });

  it('returns 500 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('down'));

    const response = await GET(new NextRequest('http://localhost/api/cost-estimate'));

    expect(response.status).toBe(500);
  });
});
