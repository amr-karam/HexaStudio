import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authToken = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/api/odoo/team/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: authToken }),
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch team member' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}