import { createContext, useContext, ReactNode } from 'react';

export interface ThemeColors {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  error: string;
}

const HEXA_THEME: ThemeColors = {
  background: '#0a0a0a',
  surface: '#111111',
  foreground: '#f5f5f0',
  muted: '#8a8a80',
  accent: '#d4af37',
  border: 'rgba(255, 255, 255, 0.08)',
  error: '#ef4444',
};

const ThemeContext = createContext<{ colors: ThemeColors }>({ colors: HEXA_THEME });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={{ colors: HEXA_THEME }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
