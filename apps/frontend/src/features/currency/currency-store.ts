'use client';

import { create } from 'zustand';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  region?: string;
}

interface CurrencyState {
  /** null = auto-detect based on locale */
  selectedCurrency: string | null;
  availableCurrencies: CurrencyOption[];
  isHydrated: boolean;
  isLoading: boolean;
  setCurrency: (code: string | null) => void;
  setAvailableCurrencies: (currencies: CurrencyOption[]) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'hexa_currency_preference';

export const useCurrencyStore = create<CurrencyState>()((set) => ({
  selectedCurrency: null,
  availableCurrencies: [],
  isHydrated: false,
  isLoading: true,

  setCurrency: (code) => {
    if (code === null) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage unavailable (SSR/private browsing)
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // localStorage unavailable (SSR/private browsing)
      }
    }
    set({ selectedCurrency: code });
  },

  setAvailableCurrencies: (currencies) => set({ availableCurrencies: currencies }),

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      set({ selectedCurrency: saved, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
