import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const search = searchParams.get('search') || '';

    const headersList = await headers();
    const authToken = headersList.get('authorization');

    const response = await fetch(`${BACKEND_URL}/api/odoo/crm/leads?${new URLSearchParams({ limit, offset, search })}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: authToken }),
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch CRM leads' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CRM leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}