import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The route handler imports @/lib/api-client which imports @sentry/nextjs.
// Its CJS build requires next/constants, which cannot be resolved from the
// root-hoisted @sentry/nextjs in this monorepo (next is nested under
// apps/frontend/node_modules). This proxy route's contract is about validation
// + backend forwarding, so stub the SDK surface used by the handler graph.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

/**
 * Tests for POST /api/v1/ai/spatial-synthesis/voice proxy route.
 * Covers validation, backend forwarding, and graceful 502 degradation.
 */

function makeVoiceRequest(body: unknown): Request {
  return new Request('http://localhost/api/v1/ai/spatial-synthesis/voice', {
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

  it('returns 502 when the backend responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { POST } = await import('@/app/api/v1/ai/spatial-synthesis/voice/route');

    const response = await POST(makeVoiceRequest({ audioData: 'AAAA', mimeType: 'audio/webm' }));

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeDefined();
  });
});
