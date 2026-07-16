'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, LOCALES } from './config';
import { Messages, getMessages } from './messages';

interface LocaleContextType {
  locale: Locale;
  messages: Messages;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const STORAGE_KEY = 'hexa-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const messages = getMessages(locale);
  const dir = LOCALES[locale].dir;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && LOCALES[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = LOCALES[newLocale].dir;
  }, []);

  const t = useCallback((path: string): string => {
    const keys = path.split('.');
    let value: unknown = messages;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    return typeof value === 'string' ? value : path;
  }, [messages]);

  return (
    <LocaleContext.Provider value={{ locale, messages, dir, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
