import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * HEXA Hub — Middleware
 *
 * Handles:
 * - Authentication guard (redirect to /login if no token cookie)
 * - RBAC role routing (CLIENT → /client, others → /dashboard)
 * - Public routes (/, /login) always accessible
 */

const PUBLIC_ROUTES = new Set(['/', '/login', '/favicon.ico', '/robots.txt', '/manifest.json']);

/**
 * Extract cookies from the request in a type-safe way.
 */
function getCookies(request: NextRequest): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name) {
        cookies[name] = rest.join('=');
      }
    });
  }
  return cookies;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = getCookies(request);

  // Always allow public routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Check authentication via role cookie
  const role = cookies.hub_role;

  // Client routes — require CLIENT role
  if (pathname.startsWith('/client')) {
    if (role === 'CLIENT') {
      return NextResponse.next();
    }
    // Not a client or no role — redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Dashboard routes — require any authenticated role
  if (pathname.startsWith('/dashboard')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Protected route without matching role — redirect to login
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones containing a dot (e.g. file.ext),
     * and except for API routes, _next, and static assets.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|.*\\..*).*)',
  ],
};
