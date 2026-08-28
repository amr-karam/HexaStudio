/**
 * HEXA Portal — Client-side UI State (Zustand)
 *
 * Manages transient UI state: sidebar visibility, command palette,
 * theme preference, sidebar collapsed state. Server state (dashboard data)
 * lives in TanStack Query.
 */

import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface PortalUIState {
  /** Whether the sidebar drawer is open on mobile. */
  isSidebarOpen: boolean;
  /** Whether the sidebar is collapsed to icon rail (desktop). */
  isSidebarCollapsed: boolean;
  /** Whether the command palette overlay is visible. */
  isCommandPaletteOpen: boolean;
  /** Active color theme. */
  theme: Theme;

  /* Actions */
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

const _THEME_KEY = 'hexa-portal-theme';
const _SIDEBAR_COLLAPSED_KEY = 'hexa-portal-sidebar-collapsed';

function _getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('hexa-portal-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('hexa-portal-sidebar-collapsed');
  return stored === 'true';
}

export const usePortalStore = create<PortalUIState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: getInitialSidebarCollapsed(),
  isCommandPaletteOpen: false,
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  toggleSidebarCollapsed: () => set((s) => {
    const next = !s.isSidebarCollapsed;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hexa-portal-sidebar-collapsed', String(next));
    }
    return { isSidebarCollapsed: next };
  }),
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hexa-portal-sidebar-collapsed', String(collapsed));
    }
    set({ isSidebarCollapsed: collapsed });
  },

  toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hexa-portal-theme', theme);
    }
    set({ theme });
  },
}));
