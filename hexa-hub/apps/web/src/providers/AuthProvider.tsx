'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@hexa-hub/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = 'hub_token';
const USER_KEY = 'hub_user';

/**
 * Security notes:
 * - We use sessionStorage (not localStorage) so tokens are cleared on tab close.
 * - The role is stored in an HttpOnly-capable cookie path for middleware RBAC.
 * - In production, the backend should set an HttpOnly, Secure cookie for the
 *   refresh token. The access token should be short-lived (15min).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      const storedUser = sessionStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        // Basic token validation — reject if it doesn't look like a JWT
        if (storedToken.split('.').length === 3) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
        }
      }
    } catch {
      // Corrupted storage — clear it
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (newToken: string, newUser: User) => {
      // Validate JWT structure before storing
      if (newToken.split('.').length !== 3) {
        throw new Error('Invalid token format');
      }

      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));

      // Set role cookie for middleware RBAC (SameSite=Strict, Secure)
      document.cookie = `hub_role=${newUser.role}; path=/; SameSite=Strict; Secure; max-age=86400`;

      setToken(newToken);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    document.cookie = 'hub_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
