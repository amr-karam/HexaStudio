// ─── HEXA Hub — i18n Barrel Export ────────────────────────────────────────
// Central export point for the internationalisation module.
// ───────────────────────────────────────────────────────────────────────────

export {
  default as i18n,
  useTranslation,
  getCurrentLocale,
  getDirection,
  applyDocumentDirection,
  SUPPORTED_LOCALES,
  LOCALE_MAP,
} from './config';

export type { SupportedLocale, LocaleInfo } from './config';
