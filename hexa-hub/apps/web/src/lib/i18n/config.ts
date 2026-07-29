// ─── HEXA Hub — i18n Configuration ────────────────────────────────────────
// i18next setup with English (en) and Arabic (ar) locales.
// Arabic uses RTL direction. Language preference is persisted in localStorage.
//
// NOTE: i18n dependencies not yet installed. Run:
//   npm install i18next react-i18next i18next-browser-languagedetector
// Then replace this stub with the full implementation.
// ───────────────────────────────────────────────────────────────────────────

'use client';

// ─── Supported Locales ────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface LocaleInfo {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const LOCALE_MAP: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    dir: 'ltr',
    flag: '🇬🇧',
  },
  ar: {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
  },
};

// ─── Stub: useTranslation ─────────────────────────────────────────────────

export function useTranslation() {
  return {
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: () => Promise.resolve(),
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getCurrentLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('hexa_language');
  if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale;
  }
  return 'en';
}

export function getDirection(locale?: SupportedLocale): 'ltr' | 'rtl' {
  const resolved = locale ?? getCurrentLocale();
  return LOCALE_MAP[resolved]?.dir ?? 'ltr';
}

export function applyDocumentDirection(locale?: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  const dir = getDirection(locale);
  document.documentElement.dir = dir;
  document.documentElement.lang = locale ?? getCurrentLocale();
}

export default { useTranslation };
