import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface AnalyzeImageBody {
  imageData?: unknown;
  mimeType?: unknown;
}

export async function POST(request: NextRequest) {
  let body: AnalyzeImageBody;
  try {
    body = (await request.json()) as AnalyzeImageBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.imageData !== 'string' || body.imageData.trim().length === 0) {
    return NextResponse.json({ error: 'imageData is required' }, { status: 400 });
  }

  return proxyToBackend('/api/v1/ai/multimodal/extract-bim', request, {
    body: {
      imageData: body.imageData,
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : undefined,
    },
  });
}