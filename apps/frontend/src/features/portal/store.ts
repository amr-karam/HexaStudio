/**
 * HEXA Portal — Client-side UI State (Zustand)
 *
 * Manages transient UI state: sidebar visibility, command palette,
 * theme preference. Server state (dashboard data) lives in TanStack Query.
 */

import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface PortalUIState {
  /** Whether the sidebar drawer is open on mobile. */
  isSidebarOpen: boolean;
  /** Whether the command palette overlay is visible. */
  isCommandPaletteOpen: boolean;
  /** Active color theme. */
  theme: Theme;

  /* Actions */
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

const THEME_KEY = 'hexa-portal-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export const usePortalStore = create<PortalUIState>((set) => ({
  isSidebarOpen: false,
  isCommandPaletteOpen: false,
  theme: getInitialTheme(),

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
    }
    set({ theme });
  },
}));
