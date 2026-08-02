/**
 * HEXA Studio — AI Spatial Synthesis Voice Proxy
 *
 * Accepts a base64-encoded voice clip and its mime type, forwards it to the
 * NestJS BFF voice transcription + spatial brief endpoint, and returns the
 * synthesized `{ transcription, brief }` payload. When the backend is
 * unreachable it degrades to a graceful 502 response so the client can fall
 * back to text prompts. No secrets are stored here — GEMINI_API_KEY lives
 * server-side in NestJS only.
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audioData, mimeType } = body as {
      audioData?: string;
      mimeType?: string;
    };

    if (typeof audioData !== 'string' || audioData.trim().length === 0) {
      return NextResponse.json({ error: 'audioData is required' }, { status: 400 });
    }

    if (typeof mimeType !== 'string' || mimeType.trim().length === 0) {
      return NextResponse.json({ error: 'mimeType is required' }, { status: 400 });
    }

    // Attempt calling the NestJS BFF voice synthesis endpoint
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/ai/spatial-synthesis/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData, mimeType }),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data: unknown = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Degrade gracefully when the backend voice service is offline or times out
    }

    return NextResponse.json(
      {
        error:
          'Voice spatial synthesis is temporarily unavailable. Please try again shortly or use the text prompt instead.',
      },
      { status: 502 },
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
