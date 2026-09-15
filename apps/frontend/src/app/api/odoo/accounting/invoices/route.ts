import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    const headersList = await headers();
    const authToken = headersList.get('authorization');

    const query: Record<string, string> = {};
    if (status) query.status = status;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    const response = await fetch(`${BACKEND_URL}/api/odoo/accounting/invoices?${new URLSearchParams(query)}`, {
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