export const LOCALES = {
  en: { label: 'English', dir: 'ltr' },
  es: { label: 'Español', dir: 'ltr' },
  fr: { label: 'Français', dir: 'ltr' },
  de: { label: 'Deutsch', dir: 'ltr' },
  ar: { label: 'العربية', dir: 'rtl' },
  ja: { label: '日本語', dir: 'ltr' },
  ko: { label: '한국어', dir: 'ltr' },
  zh: { label: '中文', dir: 'ltr' },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_PATHS = Object.keys(LOCALES) as Locale[];
