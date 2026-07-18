import { Locale } from '@/i18n/config';

interface RegionCurrency {
  region: string;
  currency: string;
  label: string;
}

const LOCALE_REGION_MAP: Record<Locale, RegionCurrency> = {
  en: { region: 'US', currency: 'USD', label: 'United States' },
  es: { region: 'ES', currency: 'EUR', label: 'España' },
  fr: { region: 'FR', currency: 'EUR', label: 'France' },
  de: { region: 'DE', currency: 'EUR', label: 'Deutschland' },
  ar: { region: 'AE', currency: 'AED', label: 'الإمارات العربية المتحدة' },
  ja: { region: 'JP', currency: 'JPY', label: '日本' },
  ko: { region: 'KR', currency: 'KRW', label: '대한민국' },
  zh: { region: 'CN', currency: 'CNY', label: '中国' },
};

export function localeToRegion(locale: Locale): { region: string; currency: string } {
  const entry = LOCALE_REGION_MAP[locale];
  return { region: entry.region, currency: entry.currency };
}

export const SUPPORTED_LOCALE_REGIONS: Array<
  { locale: Locale } & RegionCurrency
> = (Object.keys(LOCALE_REGION_MAP) as Locale[]).map((locale) => ({
  locale,
  ...LOCALE_REGION_MAP[locale],
}));
