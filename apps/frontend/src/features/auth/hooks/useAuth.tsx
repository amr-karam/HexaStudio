'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { User } from '@/types';
import { API_BASE_URL } from '@/config/constants';
import {
  setLoggedIn,
  setAccessToken,
  onAuthLogout,
  authFetch,
} from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Guards against concurrent/double logout invocations (idempotent logout).
  const logoutInFlightRef = useRef(false);

  // Register logout handler — when refresh token is revoked/expired, force UI logout
  useEffect(() => {
    onAuthLogout(() => {
      setLoggedIn(false);
      setAccessToken(null);
      setUser(null);
    });
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      // Backend contract for GET /users/me:
      // - authenticated  -> raw User object
      // - anonymous      -> { data: null } (200, not 401)
      const data = await authFetch<
        { data?: User | null } | (User & { id: string }) | null
      >(`${API_BASE_URL}/api/users/me`);
      const resolved: User | null =
        data && typeof data === 'object' && 'data' in data
          ? (data.data ?? null)
          : (data as User | null);
      setUser(resolved);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer the /me probe to requestIdleCallback so it doesn't block the
    // initial hydration commit. Anonymous users get { data: null } (200) so
    // the round-trip is wasted work during first paint.
    const id = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback(() => { void fetchUser(); })
      : setTimeout(() => { void fetchUser(); }, 0) as unknown as number;
    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [fetchUser]);

  const login = async (identifier: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid credentials');
    }

    const data = await response.json();
    setUser(data.user);

    // A new session starts — release any stale logout in-flight guard.
    logoutInFlightRef.current = false;

    // Mark session active; access token stays in memory, refresh token is in
    // the httpOnly cookie set by the backend.
    setLoggedIn(true);
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    setUser(data.user);

    // A new session starts — release any stale logout in-flight guard.
    logoutInFlightRef.current = false;

    // Mark session active; access token stays in memory, refresh token is in
    // the httpOnly cookie set by the backend.
    setLoggedIn(true);
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
  };

  const logout = useCallback(async () => {
    // Idempotent: ignore concurrent/double logout invocations until the
    // server-side revocation settles (or the user logs back in).
    if (logoutInFlightRef.current) return;
    logoutInFlightRef.current = true;

    // Clear auth state synchronously — the local session ends immediately,
    // regardless of the network result. Refresh token is in the httpOnly
    // cookie; the backend reads it from the request cookies.
    setLoggedIn(false);
    setAccessToken(null);
    setUser(null);

    // Fire-and-forget server-side revocation. Local cleanup never waits on
    // the network; the guard releases when the request settles.
    void fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .catch(() => {
        // Best-effort revocation — local session is already cleared above.
      })
      .finally(() => {
        logoutInFlightRef.current = false;
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
