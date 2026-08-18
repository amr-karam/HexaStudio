import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// The route handler graph no longer imports @sentry/nextjs (BFF proxies use
// src/lib/bff), but the stub is kept for resilience against future imports.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

/**
 * Tests for POST /api/v1/ai/spatial-synthesis/voice proxy route.
 * Covers validation, backend forwarding, and honest upstream error handling.
 */

function makeVoiceRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/v1/ai/spatial-synthesis/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/ai/spatial-synthesis/voice', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects a request without audioData', async () => {
    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ mimeType: 'audio/webm' }));

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('audioData is required');
  }, 15000);

  it('rejects a request with an empty audioData payload', async () => {
    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: '   ', mimeType: 'audio/webm' }));

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('audioData is required');
  });

  it('rejects a request without mimeType', async () => {
    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: 'AAAA' }));

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('mimeType is required');
  });

  it('forwards a valid voice clip to the backend and returns transcription + brief', async () => {
    const backendResponse = {
      transcription: 'warm timber interior with soft lighting',
      brief: {
        atmosphere: 'Organic Warmth & Biophilic Harmony',
        recommendedLighting: 'golden_hour',
        recommendedMaterial: 'warm_oak',
        colorPalette: ['#8B5A2B', '#D4AF37'],
        designRationale: 'Voice-derived spatial brief.',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => backendResponse,
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://backend.example.com');

    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: 'AAAA', mimeType: 'audio/webm' }));

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      transcription: string;
      brief: { recommendedLighting: string; recommendedMaterial: string };
    };
    expect(body.transcription).toBe('warm timber interior with soft lighting');
    expect(body.brief.recommendedLighting).toBe('golden_hour');
    expect(body.brief.recommendedMaterial).toBe('warm_oak');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/v1/ai/spatial-synthesis/voice',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('returns 502 when the backend is offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: 'AAAA', mimeType: 'audio/webm' }));

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeDefined();
  });

  it('passes through the upstream error status honestly instead of fabricating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      }),
    );

    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: 'AAAA', mimeType: 'audio/webm' }));

    expect(response.status).toBe(500);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('Internal Server Error');
  });

  it('forwards a 401 from the backend without fabricating a response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      }),
    );

    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: 'AAAA', mimeType: 'audio/webm' }));

    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('Unauthorized');
  });

  it('forwards the auth_token cookie from the incoming request to the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transcription: 'test', brief: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://backend.example.com');

    const request = new NextRequest(
      'http://localhost/api/v1/ai/spatial-synthesis/voice',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=eyJhbGciOiJSUzI1NiJ9.test; another=ignored',
        },
        body: JSON.stringify({ audioData: 'AAAA', mimeType: 'audio/webm' }),
      },
    );

    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example.com/api/v1/ai/spatial-synthesis/voice',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Cookie: 'auth_token=eyJhbGciOiJSUzI1NiJ9.test',
        }),
      }),
    );
  });
});
