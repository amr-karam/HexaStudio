import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencyStore, type CurrencyOption } from '@/features/currency/currency-store';

const STORAGE_KEY = 'hexa_currency_preference';

const OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', region: 'US' },
  { code: 'EUR', symbol: '€', name: 'Euro', region: 'FR' },
];

beforeEach(() => {
  localStorage.clear();
  useCurrencyStore.setState({
    selectedCurrency: null,
    availableCurrencies: [],
    isLoading: true,
    isHydrated: true,
  });
});

describe('useCurrencyStore', () => {
  it('defaults to auto-detect (null override)', () => {
    expect(useCurrencyStore.getState().selectedCurrency).toBeNull();
  });

  it('setCurrency stores the override and persists it to localStorage', () => {
    useCurrencyStore.getState().setCurrency('EUR');

    expect(useCurrencyStore.getState().selectedCurrency).toBe('EUR');

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      state: { selectedCurrency: string | null };
    };
    expect(parsed.state.selectedCurrency).toBe('EUR');
  });

  it('resetToAuto clears the override back to null', () => {
    useCurrencyStore.getState().setCurrency('JPY');
    useCurrencyStore.getState().resetToAuto();

    expect(useCurrencyStore.getState().selectedCurrency).toBeNull();

    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw as string) as {
      state: { selectedCurrency: string | null };
    };
    expect(parsed.state.selectedCurrency).toBeNull();
  });

  it('does not persist the runtime currency catalog or loading flags', () => {
    useCurrencyStore.getState().setAvailableCurrencies(OPTIONS);
    useCurrencyStore.getState().setCurrency('USD');

    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw as string) as { state: Record<string, unknown> };
    expect(parsed.state).toEqual({ selectedCurrency: 'USD' });
    expect(parsed.state).not.toHaveProperty('availableCurrencies');
    expect(parsed.state).not.toHaveProperty('isLoading');
  });

  it('setAvailableCurrencies updates the runtime catalog', () => {
    useCurrencyStore.getState().setAvailableCurrencies(OPTIONS);
    expect(useCurrencyStore.getState().availableCurrencies).toHaveLength(2);
    expect(
      useCurrencyStore.getState().availableCurrencies.map((c) => c.code),
    ).toEqual(['USD', 'EUR']);
  });
});
