/**
 * HEXA Portal v3.0 — AI Copilot Multimodal Query Proxy
 *
 * Accepts text queries with optional image and/or audio data and proxies to
 * the NestJS BFF portal/copilot/multimodal-query endpoint. Upstream failures
 * surface honestly (401/403/5xx pass through; unreachable backend yields 502).
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface MultimodalQueryBody {
  query?: unknown;
  projectName?: unknown;
  imageData?: unknown;
  mimeType?: unknown;
  audioData?: unknown;
  audioMimeType?: unknown;
}

export async function POST(request: NextRequest) {
  let body: MultimodalQueryBody;
  try {
    body = (await request.json()) as MultimodalQueryBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.query && !body.imageData && !body.audioData) {
    return NextResponse.json(
      { error: 'At least one of query, imageData, or audioData is required' },
      { status: 400 },
    );
  }

  return proxyToBackend('/api/v1/portal/copilot/multimodal-query', request, {
    body: {
      query: typeof body.query === 'string' ? body.query : '',
      projectName: typeof body.projectName === 'string' ? body.projectName : 'Horizon Villa',
      imageData: body.imageData,
      mimeType: body.mimeType,
      audioData: body.audioData,
      audioMimeType: body.audioMimeType,
    },
    timeoutMs: 15_000,
  });
}