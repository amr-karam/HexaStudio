import { NextResponse } from 'next/server';
import { authenticatedFetch } from '@/lib/api-client';
import { API_BASE_URL } from '@/config/constants';

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, persona } = body;

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/v1/agents/memory`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId || 'default',
          persona: persona || 'general',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn('Backend agent memory clear failed:', err);
    }

    return NextResponse.json({ ok: true, sessionId: sessionId || 'default', persona: persona || 'general' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear agent memory', details: String(error) },
      { status: 500 }
    );
  }
}
