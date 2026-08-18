// ─── HEXA Hub — i18n Initialization ────────────────────────────────────────
// This file initializes i18next with react-i18next and browser language
// detection. Import this file once in the root layout to bootstrap i18n.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enResources from './locales/en.json';
import arResources from './locales/ar.json';
import { LANG_STORAGE_KEY } from './config';

const resources = {
  en: { translation: enResources },
  ar: { translation: arResources },
} as const;

const initialLanguage =
  typeof window !== 'undefined'
    ? window.sessionStorage.getItem(LANG_STORAGE_KEY) ?? undefined
    : undefined;

i18n.use(initReactI18next).use(LanguageDetector).init({
  resources,
  lng: initialLanguage ?? 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
  detection: {
    // Use sessionStorage (not localStorage) to reduce XSS attack surface
    sessionStorage: true,
    localStorage: false,
    cookie: false,
    key: LANG_STORAGE_KEY,
    // Detection priority: query param → cookie → htmlTag → navigator
    order: ['querystring', 'cookie', 'htmltag', 'navigator'],
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
