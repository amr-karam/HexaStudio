'use client';

import { useEffect, type ReactNode } from 'react';
import { useCurrencyStore, type CurrencyOption } from './currency-store';
import { currencyApi } from './api';

const FALLBACK_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', region: 'US' },
  { code: 'EUR', symbol: '€', name: 'Euro', region: 'FR' },
  { code: 'GBP', symbol: '£', name: 'British Pound', region: 'GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', region: 'JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', region: 'CN' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', region: 'KR' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', region: 'AE' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', region: 'SA' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', region: 'CA' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', region: 'AU' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', region: 'CH' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', region: 'IN' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', region: 'BR' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', region: 'MX' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', region: 'SE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', region: 'SG' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', region: 'NO' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', region: 'NZ' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', region: 'TR' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', region: 'ZA' },
] as const;

/** Known currency symbols used as a fast lookup before falling back to Intl. */
const KNOWN_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  AED: 'د.إ',
  SAR: '﷼',
  CAD: 'CA$',
  AUD: 'AU$',
  CHF: 'CHF',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  SGD: 'S$',
  HKD: 'HK$',
  TRY: '₺',
  ZAR: 'R',
  PLN: 'zł',
  THB: '฿',
  ILS: '₪',
  RUB: '₽',
  PHP: '₱',
  IDR: 'Rp',
  MYR: 'RM',
  VND: '₫',
  EGP: 'E£',
  NGN: '₦',
};

function resolveCurrencySymbol(code: string): string {
  if (KNOWN_SYMBOLS[code]) return KNOWN_SYMBOLS[code];
  try {
    const formatted = (0)
      .toLocaleString('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
      })
      .replace(/[\d,.\s]/g, '')
      .trim();
    return formatted || code;
  } catch {
    return code;
  }
}

function resolveCurrencyName(code: string): string {
  if ('DisplayNames' in Intl) {
    try {
      const name = new Intl.DisplayNames('en', { type: 'currency' }).of(code);
      return name ?? code;
    } catch {
      return code;
    }
  }
  return code;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const hydrate = useCurrencyStore((s) => s.hydrate);
  const setAvailableCurrencies = useCurrencyStore((s) => s.setAvailableCurrencies);
  const setLoading = useCurrencyStore((s) => s.setLoading);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    currencyApi
      .listCurrencies()
      .then((configs) => {
        if (cancelled) return;
        const apiOptions: CurrencyOption[] = configs.map((c) => ({
          code: c.currency,
          symbol: resolveCurrencySymbol(c.currency),
          name: resolveCurrencyName(c.currency),
          region: c.region,
        }));

        // Merge with fallbacks so the list is always comprehensive
        const existingCodes = new Set(apiOptions.map((o) => o.code));
        const merged = [
          ...apiOptions,
          ...FALLBACK_CURRENCIES.filter((f) => !existingCodes.has(f.code)),
        ];
        setAvailableCurrencies(merged);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAvailableCurrencies([...FALLBACK_CURRENCIES]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setAvailableCurrencies, setLoading]);

  return <>{children}</>;
}
