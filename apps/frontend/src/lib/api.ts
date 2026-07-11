/**
 * Shared HTTP helpers for talking to the backend/API.
 *
 * These centralize the repeated `fetch` + `response.ok` + `response.json()`
 * boilerplate that was previously copied across data hooks and fetchers.
 * Callers still pass the full URL so that per-feature base URLs and caching
 * options (e.g. Next.js `next.revalidate`) remain explicit at the call site.
 */

/**
 * Fetches JSON from `url`, throwing an Error with `errorMessage` when the
 * response is not `ok`. Use for callers that want failures to propagate
 * (e.g. React Query `queryFn`/`mutationFn`).
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit,
  errorMessage = 'Request failed',
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetches JSON from `url`, returning `fallback` on any non-ok response or
 * thrown error (including timeouts/aborts). Use for callers that must never
 * throw (e.g. server-side rendering data fetchers with graceful defaults).
 *
 * When `timeoutMs` is provided, the request is aborted after that many
 * milliseconds and `fallback` is returned.
 */
export async function fetchJsonSafe<T>(
  url: string,
  fallback: T,
  options: RequestInit = {},
  timeoutMs?: number,
): Promise<T> {
  try {
    const signal =
      timeoutMs !== undefined ? AbortSignal.timeout(timeoutMs) : options.signal;
    const response = await fetch(url, { ...options, signal });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
