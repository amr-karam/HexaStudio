'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User } from '@/types';
import { API_BASE_URL } from '@/config/constants';
import {
  setRefreshToken,
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

  // Register logout handler — when refresh token is revoked/expired, force UI logout
  useEffect(() => {
    onAuthLogout(() => {
      setRefreshToken(null);
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
    // Check if user is logged in by calling /me (cookie is sent automatically)
    fetchUser();
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

    // Store tokens in memory for automatic renewal
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
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

    // Store tokens in memory for automatic renewal
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setRefreshToken(null);
      setAccessToken(null);
      setUser(null);
    }
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
