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
[data-theme="light"] {
  /* Map the unified sl-* tokens to a warm parchment palette */
  --sl-obsidian: 17 12% 6%;
  --sl-void: 0 0% 100%;
  --sl-stone: 210 8% 93%;
  --sl-silver: 210 10% 88%;
  --sl-mist: 210 8% 94%;
  --sl-alabaster: 210 10% 12%;
  --sl-warm-neutral: 30 18% 45%;
  --sl-gold-hover: 38 55% 55%;
  --sl-gold-subtle: 40 50% 90%;
  --sl-gold-rgb: 196, 176, 145;
  --sl-gold-25: 40 50% 92%;
}

[data-theme="light"] .glass {
  background: rgba(17, 12%, 6%, 0.03);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(196, 176, 145, 0.12);
}

[data-theme="light"] .glass-hover:hover {
  background: rgba(17, 12%, 6%, 0.05);
}

[data-theme="light"] ::-webkit-scrollbar-thumb {
  background: var(--sl-stone);
}

[data-theme="light"] ::selection {
  background-color: var(--sl-gold-25);
  color: var(--sl-alabaster);
}

[data-theme="light"] .shadow-gold-ambient {
  --tw-shadow: 0 0 60px -20px rgba(196, 176, 145, 0.14);
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
