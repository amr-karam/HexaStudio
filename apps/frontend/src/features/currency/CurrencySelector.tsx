'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrencyStore } from './currency-store';

const DROPDOWN_ANIMATION = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.96 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
} as const;

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.svg
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
    className="text-current"
  >
    <path
      d="M2 3.5L5 6.5L8 3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

const SearchIcon = () => (
  <svg
    className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-4 w-4 text-accent"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedCurrency = useCurrencyStore((s) => s.selectedCurrency);
  const availableCurrencies = useCurrencyStore((s) => s.availableCurrencies);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const filteredCurrencies = useMemo(
    () =>
      availableCurrencies.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [availableCurrencies, search],
  );

  /* ---------- close on click outside ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ---------- close on Escape ---------- */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  /* ---------- focus search on open ---------- */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /* ---------- reset search on close ---------- */
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setActiveIndex(-1);
    }
  }, [isOpen]);

  /* ---------- scroll active item into view ---------- */
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>('[role="option"]');
    const target = items[activeIndex];
    target?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  /* ---------- select handler ---------- */
  const handleSelect = useCallback(
    (code: string | null) => {
      setCurrency(code);
      setIsOpen(false);
    },
    [setCurrency],
  );

  /* ---------- keyboard navigation ---------- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const items = filteredCurrencies;
      const total = items.length + 1; // + 1 for the Auto option

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(total - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex === 0) {
            handleSelect(null);
          } else if (activeIndex > 0 && items[activeIndex - 1]) {
            handleSelect(items[activeIndex - 1].code);
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [activeIndex, filteredCurrencies, handleSelect],
  );

  /* ---------- selected label ---------- */
  const selectedInfo = selectedCurrency
    ? availableCurrencies.find((c) => c.code === selectedCurrency)
    : null;

  return (
    <div ref={containerRef} className="relative">
      {/* -------- trigger button -------- */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all duration-300',
          isOpen
            ? 'border-accent/40 bg-accent/5 text-accent'
            : 'border-border/50 text-neutral-400 hover:border-accent/30 hover:text-accent/80',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={
          selectedCurrency
            ? `Currency: ${selectedCurrency}`
            : 'Currency: Auto (based on your location)'
        }
      >
        {selectedInfo ? (
          <>
            <span className="text-sm">{selectedInfo.symbol}</span>
            <span className="hidden sm:inline">{selectedInfo.code}</span>
          </>
        ) : (
          <>
            <span className="h-3 w-3 rounded-full border border-accent/50 bg-accent/10" />
            <span className="hidden sm:inline">Auto</span>
          </>
        )}
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* -------- dropdown -------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...DROPDOWN_ANIMATION}
            className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right"
            role="listbox"
            aria-label="Select currency"
          >
            <div className="overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/50">
              {/* search input */}
              <div className="border-b border-border/30 p-3">
                <div className="relative">
                  <SearchIcon />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setActiveIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search currencies..."
                    className="w-full rounded-lg border border-border/30 bg-surface/50 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-neutral-600 focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors"
                    aria-label="Search currencies"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* currency list */}
              <ul
                ref={listRef}
                className="max-h-64 overflow-y-auto py-1"
                role="listbox"
                aria-label="Available currencies"
              >
                {/* ---- Auto option ---- */}
                <OptionItem
                  index={0}
                  activeIndex={activeIndex}
                  isSelected={selectedCurrency === null}
                  onSelect={() => handleSelect(null)}
                  onHover={() => setActiveIndex(0)}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
                      selectedCurrency === null
                        ? 'border-accent bg-accent/20'
                        : 'border-neutral-600',
                    )}
                  >
                    {selectedCurrency === null && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">Auto</span>
                    <span className="text-[10px] text-neutral-500">
                      Based on your location
                    </span>
                  </div>
                  {selectedCurrency === null && (
                    <span className="ml-auto">
                      <CheckIcon />
                    </span>
                  )}
                </OptionItem>

                {/* ---- divider ---- */}
                <div
                  className="mx-4 my-1 border-t border-border/20"
                  role="separator"
                />

                {/* ---- currency options ---- */}
                {filteredCurrencies.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-neutral-500">
                    No currencies found
                  </li>
                ) : (
                  filteredCurrencies.map((currency, idx) => {
                    const itemIndex = idx + 1; // +1 because Auto is at index 0
                    const isSelected = selectedCurrency === currency.code;
                    return (
                      <OptionItem
                        key={currency.code}
                        index={itemIndex}
                        activeIndex={activeIndex}
                        isSelected={isSelected}
                        onSelect={() => handleSelect(currency.code)}
                        onHover={() => setActiveIndex(itemIndex)}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-surface/50 text-sm font-medium">
                          {currency.symbol}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium text-foreground">
                            {currency.code}
                          </span>
                          <span className="truncate text-[10px] text-neutral-500">
                            {currency.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="ml-auto shrink-0">
                            <CheckIcon />
                          </span>
                        )}
                      </OptionItem>
                    );
                  })
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal option item component                                     */
/* ------------------------------------------------------------------ */

interface OptionItemProps {
  index: number;
  activeIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  children: React.ReactNode;
}

function OptionItem({
  index,
  activeIndex,
  isSelected,
  onSelect,
  onHover,
  children,
}: OptionItemProps) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-xs transition-colors duration-150',
        activeIndex === index
          ? 'bg-accent/10 text-accent'
          : isSelected
            ? 'bg-accent/5 text-accent'
            : 'text-neutral-400 hover:bg-white/5 hover:text-foreground',
      )}
    >
      {children}
    </li>
  );
}
