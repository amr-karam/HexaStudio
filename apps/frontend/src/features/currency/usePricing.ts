'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { currencyApi, PricingResponse } from './api';
import { localeToRegion } from './locale-region';

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
  const { region, currency } = localeToRegion(locale);

  const [state, setState] = useState<RegionalPriceState>({
    formatted: formatCurrency(baseAmountUSD, locale, 'USD'),
    loading: true,
    currency,
    taxRate: 0,
    includesTax: false,
    region,
  });

  useEffect(() => {
    let isCancelled = false;

    setState((prev) => ({
      ...prev,
      loading: true,
      currency,
      region,
    }));

    currencyApi
      .previewPrice({ baseAmount: baseAmountUSD, baseCurrency: 'USD', region })
      .then((res: PricingResponse) => {
        if (isCancelled) return;
        setState({
          formatted: formatCurrency(res.finalAmount, locale, res.currency),
          loading: false,
          currency: res.currency,
          taxRate: res.taxRate,
          includesTax: res.includesTax,
          region,
        });
      })
      .catch(() => {
        if (isCancelled) return;
        // Backend not registered yet — fall back to a sensible local USD value.
        setState({
          formatted: formatCurrency(baseAmountUSD, locale, 'USD'),
          loading: false,
          currency: 'USD',
          taxRate: 0,
          includesTax: false,
          region,
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [baseAmountUSD, locale, region, currency]);

  return state;
}
