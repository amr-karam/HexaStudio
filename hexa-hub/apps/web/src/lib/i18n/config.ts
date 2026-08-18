// ─── HEXA Hub — i18n Configuration ────────────────────────────────────────
// Type definitions, locale info, and helper utilities for
// English (en) and Arabic (ar) locales.
// Arabic uses RTL direction. Language preference is persisted in sessionStorage.
//
// The i18next instance is initialized in src/lib/i18n/i18n.ts
// and should be imported once in the root layout.
// ───────────────────────────────────────────────────────────────────────────

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

// ─── Storage Key ───────────────────────────────────────────────────────────

export const LANG_STORAGE_KEY = 'hexa_language';

// ─── Helpers (framework-agnostic) ─────────────────────────────────────────

/** Returns the text direction for the given locale. */
export function getDirection(locale?: SupportedLocale): 'ltr' | 'rtl' {
  const resolved = locale ?? 'en';
  return LOCALE_MAP[resolved]?.dir ?? 'ltr';
}

/** Applies the dir and lang attributes to <html>. */
export function applyDocumentDirection(locale?: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  const dir = getDirection(locale);
  const lang = locale ?? 'en';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

/**
 * Returns the current locale from the i18next instance or sessionStorage.
 * Safe to call in SSR (returns 'en').
 */
export function getCurrentLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  // Import from react-i18next — the instance is set up by i18n.ts
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { i18n: i18nInstance } = require('react-i18next');
  const lang = i18nInstance?.language || sessionStorage.getItem(LANG_STORAGE_KEY) || 'en';
  if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return 'en';
}

/**
 * Switches the active language and persists it to sessionStorage.
 * Also updates the document dir/lang attributes.
 */
export async function changeLanguage(locale: SupportedLocale): Promise<void> {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LANG_STORAGE_KEY, locale);
    applyDocumentDirection(locale);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { i18n: i18nInstance } = require('react-i18next');
  await i18nInstance?.changeLanguage(locale);
}

const i18n = {
  SUPPORTED_LOCALES,
  LOCALE_MAP,
  LANG_STORAGE_KEY,
  getCurrentLocale,
  getDirection,
  applyDocumentDirection,
  changeLanguage,
};

export default i18n;
