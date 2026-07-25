import { API_BASE_URL } from '@/config/constants';
import { captureException } from '@sentry/nextjs';

// ─── Module-level state ───────────────────────────────────────────────────────
// Refresh token held in memory only — never persisted to localStorage/cookies.
let _refreshToken: string | null = null;
let _refreshPromise: Promise<boolean> | null = null;
let _onAuthLogout: (() => void) | null = null;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Store the refresh token in memory after login/register/refresh.
 * Call this from useAuth when a new token pair is received.
 */
export function setRefreshToken(token: string | null): void {
  _refreshToken = token;
}

/**
 * Get the current refresh token (e.g. for mobile token storage).
 */
export function getRefreshToken(): string | null {
  return _refreshToken;
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
      ...options.headers,
    },
  };

  let response = await fetch(url, merged);

  // If 401 and we have a refresh token, try to refresh once
  if (response.status === 401 && _refreshToken) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry the original request — cookies are now updated
      response = await fetch(url, merged);
    }
  }

  return response;
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
  if (!_refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: _refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid — log out
      handleAuthFailure();
      return false;
    }

    const data = await response.json();

    // Store the new refresh token
    if (data.refreshToken) {
      _refreshToken = data.refreshToken;
    }

    return true;
  } catch (error) {
    captureException(error);
    handleAuthFailure();
    return false;
  }
}

function handleAuthFailure(): void {
  _refreshToken = null;
  _onAuthLogout?.();
}
