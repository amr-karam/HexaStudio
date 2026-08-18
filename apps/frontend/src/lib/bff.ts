import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/constants';

export const AUTH_COOKIE_NAME = 'auth_token';

const DEFAULT_UPSTREAM_TIMEOUT_MS = 30_000;

export interface ProxyOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  body?: unknown;
  timeoutMs?: number;
}

function extractCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) continue;
    if (part.slice(0, separatorIndex).trim() === name) {
      return part.slice(separatorIndex + 1).trim();
    }
  }
  return null;
}

/**
 * Build upstream-forwardable auth headers from the incoming BFF request.
 *
 * Server route handlers must use this instead of the browser-only module-level
 * token in `lib/api-client.ts` (which is null in server contexts). The backend
 * JwtStrategy reads the `auth_token` cookie first and falls back to the Bearer
 * header, so the cookie is forwarded verbatim when present.
 */
export function getForwardedAuthHeaders(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('cookie');
  const authCookie = extractCookie(cookieHeader, AUTH_COOKIE_NAME);
  if (authCookie) {
    return { Cookie: `${AUTH_COOKIE_NAME}=${authCookie}` };
  }

  const authorization = request.headers.get('authorization');
  if (authorization) {
    return { Authorization: authorization };
  }

  return {};
}

async function readUpstreamErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = (await response.json()) as { message?: unknown; error?: unknown };
    if (typeof data.message === 'string' && data.message.length > 0) return data.message;
    if (typeof data.error === 'string' && data.error.length > 0) return data.error;
  } catch {
    // Upstream error body was not JSON — fall back to a generic message.
  }
  return null;
}

/**
 * Proxy a request to the backend BFF. Never fabricates a response:
 * - network/connect failures surface as an honest 502,
 * - upstream 4xx/5xx pass through with their status and a sanitized message.
 */
export async function proxyToBackend(
  path: string,
  request: Request,
  options: ProxyOptions = {},
): Promise<NextResponse> {
  const { method = 'POST', body, timeoutMs = DEFAULT_UPSTREAM_TIMEOUT_MS } = options;

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getForwardedAuthHeaders(request),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return NextResponse.json(
      { error: 'Backend service unreachable. Please try again later.' },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const upstreamMessage = await readUpstreamErrorMessage(upstream);
    return NextResponse.json(
      { error: upstreamMessage ?? `Upstream request failed (HTTP ${upstream.status})` },
      { status: upstream.status },
    );
  }

  let upstreamBody: unknown;
  try {
    upstreamBody = await upstream.json();
  } catch {
    return NextResponse.json(
      { error: 'Backend returned an invalid response.' },
      { status: 502 },
    );
  }

  return NextResponse.json(upstreamBody);
}