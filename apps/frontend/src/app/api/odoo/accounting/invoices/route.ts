import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(request: Request) {
  try {
    const authToken = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const backendUrl = queryString
      ? `${BACKEND_URL}/api/odoo/accounting/invoices?${queryString}`
      : `${BACKEND_URL}/api/odoo/accounting/invoices`;

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: authToken }),
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}