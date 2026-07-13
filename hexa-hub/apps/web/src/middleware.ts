import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get role from cookie
  const role = request.cookies.get('hub_role')?.value;

  // 1. If trying to access /dashboard but is CLIENT, redirect to /client
  if (pathname.startsWith('/dashboard') && role === 'CLIENT') {
    return NextResponse.redirect(new URL('/client', request.url));
  }

  // 2. If trying to access /client but is NOT CLIENT, redirect to /dashboard (if employee) or /login
  if (pathname.startsWith('/client')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. If trying to access /login but already authenticated
  if (pathname === '/login' && role) {
    if (role === 'CLIENT') {
      return NextResponse.redirect(new URL('/client', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*', '/login'],
};
