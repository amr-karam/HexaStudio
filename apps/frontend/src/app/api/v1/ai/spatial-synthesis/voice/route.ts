/**
 * HEXA Studio — AI Spatial Synthesis Voice Proxy
 *
 * Accepts a base64-encoded voice clip and its mime type, forwards it to the
 * NestJS BFF voice transcription + spatial brief endpoint, and returns the
 * synthesized `{ transcription, brief }` payload. Upstream failures surface
 * honestly (401/403/5xx pass through; unreachable backend yields 502).
 * No secrets are stored here — GEMINI_API_KEY lives server-side in NestJS only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface VoiceSynthesisBody {
  audioData?: unknown;
  mimeType?: unknown;
}

export async function POST(request: NextRequest) {
  let body: VoiceSynthesisBody;
  try {
    body = (await request.json()) as VoiceSynthesisBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.audioData !== 'string' || body.audioData.trim().length === 0) {
    return NextResponse.json({ error: 'audioData is required' }, { status: 400 });
  }

  if (typeof body.mimeType !== 'string' || body.mimeType.trim().length === 0) {
    return NextResponse.json({ error: 'mimeType is required' }, { status: 400 });
  }

  return proxyToBackend('/api/v1/ai/spatial-synthesis/voice', request, {
    body: { audioData: body.audioData, mimeType: body.mimeType },
    timeoutMs: 30_000,
  });
}