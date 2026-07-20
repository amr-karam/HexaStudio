'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  region?: string;
}

interface CurrencyState {
  /** null = auto-detect based on locale (see locale-region.ts) */
  selectedCurrency: string | null;
  /** Runtime list, hydrated from the API with a hardcoded fallback. Not persisted. */
  availableCurrencies: CurrencyOption[];
  /** True once the persisted preference has rehydrated from localStorage. */
  isHydrated: boolean;
  /** True while the available-currency list is being fetched. */
  isLoading: boolean;
  /** Set a manual override, or pass null to reset to locale auto-detect. */
  setCurrency: (code: string | null) => void;
  /** Convenience alias — clears the override so pricing follows the locale. */
  resetToAuto: () => void;
  setAvailableCurrencies: (currencies: CurrencyOption[]) => void;
  setLoading: (loading: boolean) => void;
}

const STORAGE_KEY = 'hexa_currency_preference';

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      selectedCurrency: null,
      availableCurrencies: [],
      isHydrated: false,
      isLoading: true,

      setCurrency: (code) => set({ selectedCurrency: code }),

      resetToAuto: () => set({ selectedCurrency: null }),

      setAvailableCurrencies: (currencies) =>
        set({ availableCurrencies: currencies }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only the user's explicit override is persisted — the currency catalog
      // and loading flags are runtime-only and refetched on each session.
      partialize: (state) => ({ selectedCurrency: state.selectedCurrency }),
      onRehydrateStorage: () => () => {
        useCurrencyStore.setState({ isHydrated: true });
      },
    },
  ),
);
