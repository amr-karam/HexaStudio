import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy endpoint for Portal AI Copilot multimodal queries
 * POST /api/portal/copilot/multimodal-query
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/portal/copilot/multimodal-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Failed to process request', details: error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Multimodal query error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'portal/copilot/multimodal-query' });
}
