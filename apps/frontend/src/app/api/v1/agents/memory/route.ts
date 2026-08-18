import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface ClearMemoryBody {
  sessionId?: unknown;
  persona?: unknown;
}

export async function DELETE(request: NextRequest) {
  let body: ClearMemoryBody;
  try {
    body = (await request.json()) as ClearMemoryBody;
  } catch {
    body = {};
  }

  return proxyToBackend('/api/v1/agents/memory', request, {
    method: 'DELETE',
    body: {
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : 'default',
      persona: typeof body.persona === 'string' ? body.persona : 'general',
    },
  });
}