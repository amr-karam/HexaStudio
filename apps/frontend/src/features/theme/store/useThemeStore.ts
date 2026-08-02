import { create } from 'zustand';

export type LuxuryTheme = 'gold_obsidian' | 'silver_slate' | 'emerald_charcoal';

interface ThemeState {
  currentTheme: LuxuryTheme;
  setTheme: (theme: LuxuryTheme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'gold_obsidian',
  setTheme: (theme) => {
    set({ currentTheme: theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
}));
