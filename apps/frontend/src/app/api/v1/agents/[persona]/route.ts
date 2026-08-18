import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/bff';

interface AgentChatBody {
  message?: unknown;
  sessionId?: unknown;
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ persona: string }> }
) {
  const { persona } = await props.params;

  let body: AgentChatBody;
  try {
    body = (await request.json()) as AgentChatBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  return proxyToBackend('/api/v1/agents/chat', request, {
    body: {
      message: body.message,
      persona,
      sessionId: body.sessionId,
    },
  });
}