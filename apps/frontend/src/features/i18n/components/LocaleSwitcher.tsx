'use client';

/**
 * HEXA Studio Luxury Language Switcher (EN / AR)
 */

import React from 'react';
import { useLocale } from '@/i18n/LocaleProvider';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className="flex items-center space-x-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all"
      aria-label="Toggle language"
    >
      <span>🌐</span>
      <span>{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
