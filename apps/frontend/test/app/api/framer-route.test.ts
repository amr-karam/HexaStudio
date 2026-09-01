/**
 * Framer proxy route — contract test.
 *
 * Verifies the Next.js API route delegates to the backend and surfaces the
 * backend status code on failure, never the key.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('Framer proxy route', () => {
  it('POST forwards body and returns the backend JSON on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, url: 'https://framer.example/p' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as unknown as typeof fetch;

    const mod = await import('@/app/api/framer/route');
    const req = new NextRequest('http://localhost/api/framer', {
      method: 'POST',
      body: JSON.stringify({ siteId: 'site-123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mod.POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.url).toBe('https://framer.example/p');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/framer/publish',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('POST surfaces backend error status when publish fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('forbidden', { status: 403 }),
    ) as unknown as typeof fetch;

    const mod = await import('@/app/api/framer/route');
    const req = new NextRequest('http://localhost/api/framer', {
      method: 'POST',
      body: JSON.stringify({ siteId: 'site-403' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mod.POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Framer API error');
  });

  it('GET returns keyPresent without leaking the key value', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ keyPresent: true, source: 'backend-only' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as unknown as typeof fetch;

    const mod = await import('@/app/api/framer/route');
    const req = new NextRequest('http://localhost/api/framer', { method: 'GET' });
    const res = await mod.GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.keyPresent).toBe(true);
    expect(body).not.toHaveProperty('key');
    expect(body).not.toHaveProperty('FRAMER_API_KEY');
    expect(JSON.stringify(body)).not.toMatch(/fr_/);
  });
});
