import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface SpatialSynthesisBody {
  prompt?: unknown;
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

  return proxyToBackend('/api/v1/ai/spatial-synthesis', request, {
    body: { prompt: body.prompt },
  });
}