import { API_BASE_URL } from '@/config/constants';
import { captureException } from '@sentry/nextjs';

// ─── Module-level state ───────────────────────────────────────────────────────
// Access token in memory; refresh token lives exclusively in an httpOnly cookie
// (set by the backend) and is never stored in JS-accessible state.
let _accessToken: string | null = null;
let _isLoggedIn = false;
let _refreshPromise: Promise<boolean> | null = null;
let _onAuthLogout: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setLoggedIn(loggedIn: boolean): void {
  _isLoggedIn = loggedIn;
}

/**
 * Whether a user session is active (used to decide whether to attempt refresh).
 */
export function isLoggedIn(): boolean {
  return _isLoggedIn;
}

/**
 * Register a callback to fire when the user is forcibly logged out
 * (e.g. refresh token invalid / family revoked).
 */
export function onAuthLogout(callback: () => void): void {
  _onAuthLogout = callback;
}

/**
 * Auth-aware `fetch` wrapper.
 *
 * - Sends cookies (`credentials: 'include'`) for every request.
 * - On 401, attempts a single token refresh and retries the request once.
 * - Queues concurrent 401s so only one refresh call is made.
 */
export async function authFetch<T>(
  url: string,
  options: RequestInit = {},
  errorMessage = 'Request failed',
): Promise<T> {
  const response = await authenticatedFetch(url, options);
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

/**
 * Lower-level auth fetch that returns the raw Response.
 * Useful for callers that need status codes or headers.
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const merged: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
      ...options.headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, merged);
  } catch {
    throw new Error('Network request failed');
  }

  // On 401, attempt a single cookie-based refresh (the httpOnly refresh_token
  // cookie is sent automatically with credentials: 'include').
  if (response.status === 401) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      try {
        const retryMerged: RequestInit = {
          credentials: 'include',
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
            ...options.headers,
          },
        };
        response = await fetch(url, retryMerged);
      } catch {
        throw new Error('Network request failed after token refresh');
      }
    }
  }

  return response;
}


/**
 * Extracts Authorization header from an incoming Request
 * to be forwarded to internal backend services.
 */
export function getForwardedHeaders(request: Request): HeadersInit {
  const authHeader = request.headers.get('Authorization');
  return authHeader ? { Authorization: authHeader } : {};
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Only one refresh is performed at a time (concurrent callers share the promise).
 * Returns true if refresh succeeded, false otherwise.
 */
async function attemptTokenRefresh(): Promise<boolean> {
  // If a refresh is already in-flight, piggyback on it
  if (_refreshPromise) {
    return _refreshPromise;
  }

  _refreshPromise = doRefresh();
  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

async function doRefresh(): Promise<boolean> {
  try {
    // Cookie-first: the httpOnly refresh_token cookie is sent automatically.
    // Empty body passes the optional Zod schema; backend reads the cookie.
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    if (!response.ok) {
      handleAuthFailure();
      return false;
    }

    const data = await response.json();

    // Refresh token is in the httpOnly cookie — never store in JS.
    if (data.accessToken) {
      _accessToken = data.accessToken;
    }

    return true;
  } catch (error) {
    captureException(error);
    handleAuthFailure();
    return false;
  }
}

function handleAuthFailure(): void {
  _isLoggedIn = false;
  _onAuthLogout?.();
}
