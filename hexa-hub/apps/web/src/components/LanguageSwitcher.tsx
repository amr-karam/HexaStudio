'use client';

// ─── HEXA Hub — Language Switcher ─────────────────────────────────────────
// Premium dropdown component for toggling between English and Arabic locales.
// Persists preference to localStorage via i18next's LanguageDetector.
// Applies RTL direction to the document when Arabic is selected.
//
// Usage:
//   <LanguageSwitcher />
//   // Renders wherever placed — typically in the sidebar footer or settings.
// ───────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import {
  SUPPORTED_LOCALES,
  LOCALE_MAP,
  getCurrentLocale,
  applyDocumentDirection,
  type SupportedLocale,
} from '@/lib/i18n/config';

// ─── Props ─────────────────────────────────────────────────────────────────

export interface LanguageSwitcherProps {
  /** Optional custom class */
  className?: string;
  /** Show as compact (icon only) or full with label */
  variant?: 'compact' | 'full';
}

// ─── Component ─────────────────────────────────────────────────────────────

export function LanguageSwitcher({
  className,
  variant = 'full',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Sync with i18n state ────────────────────────────────────────────────

  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  // Update when language changes externally
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hexa_language') {
        setCurrentLocale(getCurrentLocale());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ── Handle locale change ─────────────────────────────────────────────────

  const handleLocaleChange = useCallback((locale: SupportedLocale) => {
    localStorage.setItem('hexa_language', locale);
    setCurrentLocale(locale);
    applyDocumentDirection(locale);
    setIsOpen(false);
  }, []);

  // ── Current locale info ──────────────────────────────────────────────────

  const currentInfo = LOCALE_MAP[currentLocale];

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* ── Trigger Button ───────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Current language: ${currentInfo.label}. Click to change.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center gap-2 rounded-xl transition-all duration-300',
          'border border-[#1F1F1F] hover:border-[#D4A843]/30',
          'bg-[#0A0A0A] text-white',
          variant === 'full' ? 'px-4 py-2.5' : 'p-2.5',
        )}
      >
        <Globe size={variant === 'full' ? 16 : 18} className="text-[#D4A843] shrink-0" />
        {variant === 'full' && (
          <>
            <span className="text-sm font-light tracking-wide text-[#E5E5E5]">
              {currentInfo.nativeLabel}
            </span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-[#555] ml-0.5"
            >
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </>
        )}
      </motion.button>

      {/* ── Dropdown Menu ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            aria-label="Select language"
            className={cn(
              'absolute bottom-full mb-2 left-0 min-w-[180px]',
              'bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
              'overflow-hidden z-50',
            )}
          >
            {SUPPORTED_LOCALES.map((locale) => {
              const info = LOCALE_MAP[locale];
              const isSelected = locale === currentLocale;

              return (
                <motion.button
                  key={locale}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => handleLocaleChange(locale)}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200',
                    isSelected && 'bg-[#D4A843]/5',
                  )}
                >
                  <span className="text-base">{info.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-light',
                        isSelected ? 'text-white' : 'text-[#888]',
                      )}
                    >
                      {info.nativeLabel}
                    </p>
                    <p className="text-[10px] text-[#555] font-light">
                      {info.label}
                    </p>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-[#D4A843] shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
