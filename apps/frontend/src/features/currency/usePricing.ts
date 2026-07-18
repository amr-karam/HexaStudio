'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { currencyApi, PricingResponse } from './api';
import { localeToRegion } from './locale-region';
import { useCurrencyStore } from './currency-store';

interface RegionalPriceState {
  formatted: string;
  loading: boolean;
  currency: string;
  taxRate: number;
  includesTax: boolean;
  region: string;
}

function formatCurrency(value: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function useRegionalPrice(baseAmountUSD: number): RegionalPriceState {
  const { locale } = useLocale();
  const { region: localeRegion, currency: localeCurrency } =
    localeToRegion(locale);

  // Read manual currency override from the Zustand store
  const selectedCurrency = useCurrencyStore((s) => s.selectedCurrency);
  const availableCurrencies = useCurrencyStore((s) => s.availableCurrencies);

  // Determine effective region + currency
  const selectedInfo = selectedCurrency
    ? availableCurrencies.find((c) => c.code === selectedCurrency)
    : null;

  const effectiveRegion = selectedInfo?.region ?? localeRegion;
  const effectiveCurrency = selectedCurrency ?? localeCurrency;

  const [state, setState] = useState<RegionalPriceState>({
    formatted: formatCurrency(baseAmountUSD, locale, effectiveCurrency),
    loading: true,
    currency: effectiveCurrency,
    taxRate: 0,
    includesTax: false,
    region: effectiveRegion,
  });

  useEffect(() => {
    let isCancelled = false;

    setState((prev) => ({
      ...prev,
      loading: true,
      currency: effectiveCurrency,
      region: effectiveRegion,
    }));

    currencyApi
      .previewPrice({
        baseAmount: baseAmountUSD,
        baseCurrency: 'USD',
        region: effectiveRegion,
      })
      .then((res: PricingResponse) => {
        if (isCancelled) return;
        setState({
          formatted: formatCurrency(res.finalAmount, locale, res.currency),
          loading: false,
          currency: res.currency,
          taxRate: res.taxRate,
          includesTax: res.includesTax,
          region: effectiveRegion,
        });
      })
      .catch(() => {
        if (isCancelled) return;
        // Backend not available — fall back to a sensible local value
        setState({
          formatted: formatCurrency(baseAmountUSD, locale, effectiveCurrency),
          loading: false,
          currency: effectiveCurrency,
          taxRate: 0,
          includesTax: false,
          region: effectiveRegion,
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [baseAmountUSD, locale, effectiveCurrency, effectiveRegion]);

  return state;
}
