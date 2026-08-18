import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface CompareDesignsBody {
  image1Data?: unknown;
  image2Data?: unknown;
  mimeType?: unknown;
}

export async function POST(request: NextRequest) {
  let body: CompareDesignsBody;
  try {
    body = (await request.json()) as CompareDesignsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.image1Data !== 'string' || body.image1Data.trim().length === 0) {
    return NextResponse.json({ error: 'image1Data is required' }, { status: 400 });
  }

  if (typeof body.image2Data !== 'string' || body.image2Data.trim().length === 0) {
    return NextResponse.json({ error: 'image2Data is required' }, { status: 400 });
  }

  return proxyToBackend('/api/v1/ai/multimodal/compare-designs', request, {
    body: {
      image1Data: body.image1Data,
      image2Data: body.image2Data,
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : undefined,
    },
  });
}