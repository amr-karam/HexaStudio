'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrencyStore, type CurrencyOption } from './currency-store';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/constants';
import { localeToRegion } from './locale-region';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

/* -------------------------------------------------------------------------- */
/*  GeoIP helpers                                                             */
/* -------------------------------------------------------------------------- */

interface GeoIPResponse {
  country: string;
  currency?: string;
  region?: string;
}

async function fetchGeoIP(): Promise<GeoIPResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/geoip`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return (await res.json()) as GeoIPResponse;
  } catch {
    return null;
  }
}

/** Map a 2-letter country code to a currency code. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  EU: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  FI: 'EUR',
  AE: 'AED',
  SA: 'SAR',
  JP: 'JPY',
  CN: 'CNY',
  KR: 'KRW',
  IN: 'INR',
  BR: 'BRL',
  MX: 'MXN',
  CA: 'CAD',
  AU: 'AUD',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  SG: 'SGD',
  NZ: 'NZD',
  TR: 'TRY',
  ZA: 'ZAR',
  RU: 'RUB',
};

function suggestCurrencyFromCountry(country: string): string | null {
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CurrencySelector() {
  const {
    selectedCurrency,
    availableCurrencies,
    isLoading: storeLoading,
    setCurrency,
  } = useCurrencyStore();

  const { t, locale, dir } = useLocale();
  const hexaMotion = useHEXAMotion();
  const { staticMode } = useMotionPolicy();
  const prefersReduced = hexaMotion.reduced || staticMode;
  const uid = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* ---- Resolve display currency ---- */
  const currentOption: CurrencyOption | undefined = selectedCurrency
    ? availableCurrencies.find((c) => c.code === selectedCurrency)
    : undefined;

  const displaySymbol = currentOption?.symbol ?? '$';
  const displayCode = currentOption?.code ?? 'USD';

  /* ---- Filtered list ---- */
  const filteredCurrencies = searchQuery
    ? availableCurrencies.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : availableCurrencies;

  /* ---- GeoIP auto-detect ---- */
  useEffect(() => {
    if (selectedCurrency !== null || storeLoading) return;
    let cancelled = false;
    setGeoLoading(true);

    fetchGeoIP()
      .then((geo) => {
        if (cancelled) return;
        if (geo) {
          const suggested = geo.currency ?? suggestCurrencyFromCountry(geo.country);
          if (suggested && availableCurrencies.find((c) => c.code === suggested)) {
            setCurrency(suggested);
            setGeoLoading(false);
            return;
          }
        }
        // Fallback to locale-based default
        const { currency: localeCurrency } = localeToRegion(locale);
        if (localeCurrency && localeCurrency !== 'USD') {
          if (availableCurrencies.find((c) => c.code === localeCurrency)) {
            setCurrency(localeCurrency);
          }
        }
        setGeoLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGeoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCurrency, storeLoading, availableCurrencies, locale, setCurrency]);

  /* ---- Open/close handlers ---- */
  const openPanel = useCallback(() => {
    setError(null);
    setIsOpen(true);
    setSearchQuery('');
    setFocusedIndex(-1);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const togglePanel = useCallback(() => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isOpen, openPanel, closePanel]);

  /* ---- Focus search on open ---- */
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow the panel animation to start
      const raf = requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  /* ---- Click outside ---- */
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closePanel();
      }
    };
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    // Delay listener to avoid immediate closure
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEscape);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closePanel]);

  /* ---- Keyboard nav within dropdown ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const items = filteredCurrencies;
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = (focusedIndex + 1) % items.length;
          setFocusedIndex(next);
          scrollToItem(next);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = (focusedIndex - 1 + items.length) % items.length;
          setFocusedIndex(prev);
          scrollToItem(prev);
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            handleSelect(items[focusedIndex].code);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          setFocusedIndex(0);
          scrollToItem(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          scrollToItem(items.length - 1);
          break;
        }
      }
    },
    [filteredCurrencies, focusedIndex],
  );

  function scrollToItem(index: number) {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>('[role="option"]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  /* ---- Selection ---- */
  const handleSelect = useCallback(
    (code: string) => {
      setCurrency(code);
      closePanel();
      // Announce selection for screen readers
      const option = availableCurrencies.find((c) => c.code === code);
      if (option) {
        const announcer = document.getElementById('currency-announce');
        if (announcer) {
          announcer.textContent = `${option.name} (${option.code}) selected`;
        }
      }
    },
    [setCurrency, closePanel, availableCurrencies],
  );

  /* ---- Compute loading state ---- */
  const isLoading = storeLoading || geoLoading;

  /* ---- Trigger label ---- */
  const triggerLabel = currentOption
    ? `${currentOption.symbol} ${currentOption.code}`
    : isLoading
      ? '...'
      : `$ USD`;

  /* ========================================================================== */
  /*  Render                                                                    */
  /* ========================================================================== */

  return (
    <div className="relative" dir={dir}>
      {/* Screen-reader live region */}
      <div
        id="currency-announce"
        role="status"
        aria-live="polite"
        className="sr-only"
      />

      {/* TRIGGER BUTTON */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${uid}-listbox`}
        aria-label={t('currency.selectCurrency') || `Currency: ${displayCode}`}
        onClick={togglePanel}
        disabled={isLoading}
        className={cn(
          'group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-mono',
          'transition-all duration-500 ease-out-expo',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isLoading
            ? 'border-border/30 text-neutral-600 cursor-not-allowed'
            : isOpen
              ? 'border-accent/60 text-accent bg-accent/5'
              : 'border-border/40 text-neutral-400 hover:border-accent/40 hover:text-accent hover:bg-accent/5',
        )}
      >
        {/* Loading spinner or symbol */}
        {isLoading ? (
          prefersReduced ? (
            <span
              className="block w-3 h-3 rounded-full border-2 border-neutral-700 border-t-accent"
              role="status"
              aria-label="Loading currencies"
            />
          ) : (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="block w-3 h-3 rounded-full border-2 border-neutral-700 border-t-accent"
          />
          )
        ) : (
          <span
            className={cn(
              'text-xs font-medium',
              currentOption ? 'text-accent' : 'text-neutral-500',
            )}
            aria-hidden="true"
          >
            {displaySymbol}
          </span>
        )}

        <span className="tracking-wider">{triggerLabel}</span>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={hexaMotion.transition('entrance', 'micro')}
          className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* DROPDOWN PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id={`${uid}-listbox`}
            role="listbox"
            aria-label={t('currency.availableCurrencies') || 'Available currencies'}
            aria-activedescendant={
              focusedIndex >= 0
                ? `${uid}-option-${filteredCurrencies[focusedIndex]?.code}`
                : undefined
            }
            initial={
              prefersReduced
                ? { opacity: 1 }
                : { opacity: 0, y: -8, scaleY: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scaleY: 0.95 }
            }
            transition={hexaMotion.transition('entrance', 'micro')}
            style={{ originY: 0 }}
            className={cn(
              'absolute z-[100] mt-2 w-72 rounded-xl border',
              'bg-surface/95 backdrop-blur-2xl border-border/40',
              'shadow-2xl shadow-black/40 overflow-hidden',
              // RTL positioning
              dir === 'rtl' ? 'right-0' : 'left-0',
            )}
          >
            {/* Search input */}
            <div className="p-3 border-b border-border/20">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  role="searchbox"
                  aria-label={t('currency.search') || 'Search currency'}
                  placeholder={t('currency.search') || 'Search currency...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'w-full bg-background/60 border border-border/30 rounded-lg',
                    'pl-9 pr-3 py-2 text-xs font-mono',
                    'text-foreground placeholder:text-neutral-600',
                    'transition-colors duration-300',
                    'focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20',
                  )}
                />
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="px-4 py-6 text-center">
                <span className="text-xs text-red-400/80 font-mono">{error}</span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCurrency('USD');
                  }}
                  className="block mx-auto mt-2 text-[10px] uppercase tracking-wider text-accent hover:text-accent-light transition-colors"
                >
                  {t('currency.fallbackToUSD') || 'Reset to USD'}
                </button>
              </div>
            )}

            {/* No results */}
            {!error && filteredCurrencies.length === 0 && (
              <div className="px-4 py-8 text-center">
                <span className="text-xs text-neutral-600 font-mono">
                  {t('currency.noResults') || 'No currencies found'}
                </span>
              </div>
            )}

            {/* Currency list */}
            {!error && filteredCurrencies.length > 0 && (
              <ul
                ref={listRef}
                className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent py-1"
                role="listbox"
                tabIndex={-1}
              >
                {filteredCurrencies.map((currency, index) => {
                  const isSelected = currency.code === selectedCurrency;
                  const isFocused = index === focusedIndex;

                  return (
                    <li
                      key={currency.code}
                      id={`${uid}-option-${currency.code}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(currency.code)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 cursor-pointer',
                        'transition-colors duration-200',
                        isSelected
                          ? 'bg-accent/10 text-accent'
                          : isFocused
                            ? 'bg-white/[0.04] text-foreground'
                            : 'text-neutral-400 hover:bg-white/[0.02] hover:text-foreground',
                      )}
                    >
                      {/* Select indicator */}
                      <span
                        className={cn(
                          'flex items-center justify-center w-5 h-5 shrink-0 rounded-full border',
                          'transition-all duration-300',
                          isSelected
                            ? 'border-accent bg-accent/20'
                            : 'border-neutral-700',
                        )}
                      >
                        {isSelected && (
                          <motion.svg
                            initial={prefersReduced ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 20,
                            }}
                            className="w-3 h-3 text-accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </motion.svg>
                        )}
                      </span>

                      {/* Symbol */}
                      <span
                        className={cn(
                          'text-sm font-mono w-8 text-center',
                          isSelected ? 'text-accent' : 'text-neutral-500',
                        )}
                        aria-hidden="true"
                      >
                        {currency.symbol}
                      </span>

                      {/* Code & name */}
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            'text-xs font-mono font-medium tracking-wide',
                            isSelected ? 'text-accent' : 'text-foreground',
                          )}
                        >
                          {currency.code}
                        </span>
                        <span className="text-[10px] text-neutral-600 truncate">
                          {currency.name}
                          {currency.region ? ` · ${currency.region}` : ''}
                        </span>
                      </div>

                      {/* Current selection badge */}
                      {isSelected && (
                        <span className="ml-auto text-[9px] uppercase tracking-widest text-accent/70 font-mono">
                          {t('common.active') || 'Active'}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border/20 flex items-center justify-between">
              <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">
                {t('currency.count') ||
                  `${availableCurrencies.length} currencies`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCurrency(null);
                  closePanel();
                }}
                className="text-[9px] uppercase tracking-widest text-neutral-600 hover:text-accent transition-colors duration-300 font-mono"
              >
                {t('currency.autoDetect') || 'Auto'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
