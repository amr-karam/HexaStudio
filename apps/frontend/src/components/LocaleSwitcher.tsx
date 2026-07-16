'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { LOCALES, LOCALE_PATHS, Locale } from '@/i18n/config';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/60 transition-colors hover:text-white/90"
      >
        <span>{LOCALES[locale].label}</span>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1 w-36 rounded-lg border border-white/10 bg-[#1A1A1A] py-1 shadow-xl">
          {LOCALE_PATHS.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l as Locale); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-start text-xs transition-colors ${
                locale === l ? 'text-[#D4AF37]' : 'text-white/60 hover:text-white/90'
              }`}
            >
              <span>{LOCALES[l].label}</span>
              {LOCALES[l].dir === 'rtl' && (
                <span className="text-[10px] text-white/30">RTL</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
