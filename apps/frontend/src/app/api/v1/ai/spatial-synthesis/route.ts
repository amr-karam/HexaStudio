import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface SpatialSynthesisBody {
  prompt?: unknown;
  projectId?: unknown;
}

export async function POST(request: NextRequest) {
  let body: SpatialSynthesisBody;
  try {
    body = (await request.json()) as SpatialSynthesisBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const payload: Record<string, unknown> = { prompt: body.prompt };
  if (typeof body.projectId === 'string' && body.projectId.trim().length > 0) {
    payload.projectId = body.projectId.trim();
  }

  return proxyToBackend('/api/v1/ai/spatial-synthesis', request, {
    body: payload,
  });
}