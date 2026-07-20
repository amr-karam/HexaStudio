import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import type { User } from '@hexastudio/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'hexa_access_token';
const REFRESH_KEY = 'hexa_refresh_token';

function getApiUrl(): string {
  return Constants.expoConfig?.extra?.apiUrl ?? 'https://api.hexastudio.net';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return;

        const response = await fetch(`${getApiUrl()}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setUser(await response.json());
        } else {
          // Token expired or revoked — clear stale credentials
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
        }
      } catch {
        // Network error: keep tokens, stay signed out for this session
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message ?? 'Invalid credentials');
    }

    const data = await response.json();
    await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    // Best-effort server-side revocation; local cleanup happens regardless
    try {
      await fetch(`${getApiUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Offline logout is fine — tokens are removed locally
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
