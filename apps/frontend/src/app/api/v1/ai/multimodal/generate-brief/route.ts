import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface GenerateBriefBody {
  projectType?: unknown;
  squareFootage?: unknown;
  stylePreference?: unknown;
  sustainabilityGoals?: unknown;
  budgetRange?: unknown;
}

export async function POST(request: NextRequest) {
  let body: GenerateBriefBody;
  try {
    body = (await request.json()) as GenerateBriefBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.projectType || !body.squareFootage) {
    return NextResponse.json(
      { error: 'projectType and squareFootage are required parameters' },
      { status: 400 }
    );
  }

  return proxyToBackend('/api/v1/ai/multimodal/generate-brief', request, {
    body: {
      projectType: body.projectType,
      squareFootage: body.squareFootage,
      stylePreference: body.stylePreference,
      sustainabilityGoals: body.sustainabilityGoals,
      budgetRange: body.budgetRange,
    },
    timeoutMs: 20_000,
  });
}