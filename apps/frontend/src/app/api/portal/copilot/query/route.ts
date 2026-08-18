import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface CopilotQueryBody {
  query?: unknown;
  projectName?: unknown;
}

export async function POST(request: NextRequest) {
  let body: CopilotQueryBody;
  try {
    body = (await request.json()) as CopilotQueryBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.query !== 'string' || body.query.trim().length === 0) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  return proxyToBackend('/api/v1/portal/copilot/query', request, {
    body: {
      query: body.query,
      projectName: typeof body.projectName === 'string' ? body.projectName : 'Horizon Villa',
    },
  });
}