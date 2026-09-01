"use server"

import { NextResponse } from 'next/server';

// Server-side API route that proxies to the backend Framer controller
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Call the backend Framer controller via internal API
    const backendResponse = await fetch('http://localhost:4000/api/framer/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      return NextResponse.json(
        { error: 'Framer API error', details: error },
        { status: backendResponse.status }
      );
    }
    
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Framer proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request) {
  try {
    const backendResponse = await fetch('http://localhost:4000/api/framer/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      return NextResponse.json(
        { error: 'Backend error', details: error },
        { status: backendResponse.status }
      );
    }
    
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Framer status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
