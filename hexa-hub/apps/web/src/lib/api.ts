// ─── HEXA Hub — API Client ────────────────────────────────────────────────
// Axios instance with JWT auth, 401 handling, and type-safe generic methods.
// ───────────────────────────────────────────────────────────────────────────

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

// ─── Constants ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'hub_token';
const USER_KEY = 'hub_user';
const LOGIN_PATH = '/login';

// ─── Storage Helper — reads from sessionStorage at runtime ─────────────────
// We read from sessionStorage (not localStorage) on every request so the
// token always reflects the current auth state. This is XSS-hardened:
// sessionStorage is cleared when the tab/window closes.

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

function clearAuth(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  document.cookie = 'hub_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
}

// ─── Axios Instance ─────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow HttpOnly cookies (refresh token) to be sent
});

// ─── Request Interceptor — Attach JWT Token ─────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — Handle 401 Unauthorized + Error Notifications ──

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      // 401 — clear auth and redirect
      if (error.response?.status === 401) {
        clearAuth();
        if (!window.location.pathname.startsWith(LOGIN_PATH)) {
          window.location.href = LOGIN_PATH;
        }
        return Promise.reject(error);
      }

      // Dispatch error event for toast notifications (skip for 401, 404, validation errors)
      const status = error.response?.status;
      if (status && status !== 401 && status !== 404 && status !== 422) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          `Request failed (${status})`;
        window.dispatchEvent(
          new CustomEvent('api:error', {
            detail: {
              message,
              status,
              url: error.config?.url || '',
              timestamp: Date.now(),
            },
          }),
        );
      }
    }
    return Promise.reject(error);
  },
);

// ─── Type-Safe Generic Request Methods ──────────────────────────────────────

/**
 * Perform a GET request with full type safety.
 * @param url — The endpoint path (relative to baseURL).
 * @param config — Optional Axios config (params, headers, etc.).
 * @returns The response data of type T.
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Perform a POST request with full type safety.
 * @param url — The endpoint path (relative to baseURL).
 * @param data — The request body.
 * @param config — Optional Axios config.
 * @returns The response data of type T.
 */
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Perform a PUT request with full type safety.
 * @param url — The endpoint path (relative to baseURL).
 * @param data — The request body.
 * @param config — Optional Axios config.
 * @returns The response data of type T.
 */
export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Perform a PATCH request with full type safety.
 * @param url — The endpoint path (relative to baseURL).
 * @param data — The request body.
 * @param config — Optional Axios config.
 * @returns The response data of type T.
 */
export async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

/**
 * Perform a DELETE request with full type safety.
 * @param url — The endpoint path (relative to baseURL).
 * @param config — Optional Axios config.
 * @returns The response data of type T.
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

// ─── Named Export Object (Alternative API) ──────────────────────────────────

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
} as const;

export default apiClient;
