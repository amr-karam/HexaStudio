'use client';

/**
 * HEXA Portal — Theme Provider
 *
 * Wraps the portal in a theming context that supports dark (default)
 * and light modes. Stores preference in localStorage and applies
 * CSS custom property overrides for the light theme.
 *
 * Philosophy: Light mode should feel like parchment — warm, muted,
 * with gold accents. Dark mode is the default obsidian.
 */

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePortalStore } from '../store';

interface PortalThemeContextType {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const PortalThemeContext = createContext<PortalThemeContextType | null>(null);

/* -------------------------------------------------------------------------- */
/*  Light-mode CSS overrides (injected into <head> on mount)                   */
/* -------------------------------------------------------------------------- */

const LIGHT_THEME_CSS = `
:root,
[data-theme="light"] {
  --color-background: #FAFAF9;
  --color-foreground: #1A1A1A;
  --color-surface: #FFFFFF;
  --color-surface-light: #F5F5F4;
  --color-surface-dark: #E7E5E4;
  --color-border: #E4E4E7;
  --color-border-light: #D4D4D8;
  --color-border-dark: #A1A1AA;
  --color-neutral-50: #18181B;
  --color-neutral-100: #27272A;
  --color-neutral-200: #3F3F46;
  --color-neutral-300: #52525B;
  --color-neutral-400: #71717A;
  --color-neutral-500: #A1A1AA;
  --color-neutral-600: #D4D4D8;
  --color-neutral-700: #E4E4E7;
  --color-neutral-800: #F4F4F5;
  --color-neutral-900: #FAFAF9;
  --glass-bg: rgba(0, 0, 0, 0.02);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-bg-hover: rgba(0, 0, 0, 0.04);
  --glass-border-hover: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
}

[data-theme="light"] .glass-hover:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}

[data-theme="light"] ::-webkit-scrollbar-thumb {
  background: var(--color-border);
}

[data-theme="light"] ::selection {
  background-color: rgba(212, 175, 55, 0.25);
  color: #1A1A1A;
}
`;

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

export function PortalThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = usePortalStore();

  useEffect(() => {
    // Inject light-theme stylesheet
    const existing = document.getElementById('hexa-portal-theme');
    if (!existing) {
      const style = document.createElement('style');
      style.id = 'hexa-portal-theme';
      style.textContent = LIGHT_THEME_CSS;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <PortalThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </PortalThemeContext.Provider>
  );
}

export function usePortalTheme() {
  const ctx = useContext(PortalThemeContext);
  if (!ctx) throw new Error('usePortalTheme must be used within PortalThemeProvider');
  return ctx;
}
