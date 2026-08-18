// ─── HEXA Hub — i18n Barrel Export ────────────────────────────────────────
// Central export point for the internationalisation module.
// ───────────────────────────────────────────────────────────────────────────

export {
  useTranslation,
} from 'react-i18next';

export {
  default as i18nInstance,
} from './i18n';

export {
  SUPPORTED_LOCALES,
  LOCALE_MAP,
  LANG_STORAGE_KEY,
  getCurrentLocale,
  getDirection,
  applyDocumentDirection,
  changeLanguage,
} from './config';

export type { SupportedLocale, LocaleInfo } from './config';
