'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Users,
  Contact,
  FolderKanban,
  CheckSquare,
  FileText,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  TrendingUp,
  Loader2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSearch } from '@/lib/hooks/use-search';
import { cn } from '@/components/ui/cn';
import { Skeleton } from '@/components/ui/skeleton';
import type { SearchResult, SearchableModel } from '@hexa-hub/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 400;
const MAX_RESULTS = 20;

interface SearchGroup {
  model: SearchableModel;
  label: string;
  icon: LucideIcon;
  color: string;
  results: SearchResult[];
}

const MODEL_CONFIG: Record<SearchableModel, { label: string; icon: LucideIcon; color: string }> = {
  'crm.lead': { label: 'CRM Leads', icon: Users, color: 'text-amber-400' },
  'res.partner': { label: 'Contacts', icon: Contact, color: 'text-blue-400' },
  'project.project': { label: 'Projects', icon: FolderKanban, color: 'text-emerald-400' },
  'project.task': { label: 'Tasks', icon: CheckSquare, color: 'text-violet-400' },
  'sale.order': { label: 'Sales Orders', icon: TrendingUp, color: 'text-rose-400' },
  'account.move': { label: 'Invoices', icon: FileText, color: 'text-cyan-400' },
  'mail.activity': { label: 'Activities', icon: Hash, color: 'text-orange-400' },
  'documents.document': { label: 'Documents', icon: FileText, color: 'text-indigo-400' },
};

// ─── SearchOverlay Props ────────────────────────────────────────────────────

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── SearchResultItem ───────────────────────────────────────────────────────

function SearchResultItem({
  result,
  isHighlighted,
  onSelect,
  onHover,
}: {
  result: SearchResult;
  isHighlighted: boolean;
  onSelect: (result: SearchResult) => void;
  onHover: () => void;
}) {
  const config = MODEL_CONFIG[result.model];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      role="option"
      aria-selected={isHighlighted}
      onMouseEnter={onHover}
      onClick={() => onSelect(result)}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 group',
        isHighlighted
          ? 'bg-[#D4A843]/10 border-l-[3px] border-l-[#D4A843]'
          : 'border-l-[3px] border-l-transparent hover:bg-white/[0.03]',
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          isHighlighted ? 'bg-[#D4A843]/15' : 'bg-[#1A1A1A] group-hover:bg-[#1F1F1F]',
        )}
      >
        <Icon
          size={17}
          className={cn(
            isHighlighted ? 'text-[#D4A843]' : config.color,
            'transition-colors duration-150',
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-light truncate">{result.title}</p>
        {result.subtitle && (
          <p className="text-[11px] text-[#555] truncate mt-0.5">{result.subtitle}</p>
        )}
      </div>
      <span
        className={cn(
          'text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full font-medium shrink-0 border',
          isHighlighted
            ? 'bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/20'
            : 'bg-[#1A1A1A] text-[#555] border-[#1F1F1F]',
          'transition-colors duration-150',
        )}
      >
        {config.label}
      </span>
    </motion.div>
  );
}

// ─── SearchSkeleton ─────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton variant="rectangular" width={36} height={36} className="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width={i % 2 === 0 ? '70%' : '50%'} />
            <Skeleton variant="text" width={i % 3 === 0 ? '40%' : '30%'} className="h-3" />
          </div>
          <Skeleton variant="text" width={70} height={20} className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── SearchEmptyState ───────────────────────────────────────────────────────

function SearchEmptyState({
  hasQuery,
  hasError,
}: {
  hasQuery: boolean;
  hasError: boolean;
}) {
  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-8 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-sm text-[#888] font-light mb-1">Search failed</p>
        <p className="text-xs text-[#555] font-light">
          Please try again or refine your query.
        </p>
      </motion.div>
    );
  }

  if (hasQuery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-8 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mb-4">
          <Search size={24} className="text-[#444]" />
        </div>
        <p className="text-sm text-[#888] font-light mb-1">No results found</p>
        <p className="text-xs text-[#555] font-light">
          Try a different search term or check for typos.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#444] font-medium mb-3 px-2">
        Quick Search
      </p>
      <p className="text-xs text-[#555] font-light px-2 mb-4">
        Search across your entire workspace — leads, contacts, projects, tasks, and more.
      </p>
      <div className="space-y-1">
        {[
          { label: 'Active projects', shortcut: 'P' },
          { label: 'Open leads', shortcut: 'L' },
          { label: 'Recent documents', shortcut: 'D' },
          { label: 'My tasks', shortcut: 'T' },
        ].map(({ label, shortcut }) => (
          <div
            key={shortcut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors group"
          >
            <Search size={13} className="text-[#444] group-hover:text-[#666] transition-colors" />
            <span className="text-sm text-[#666] font-light flex-1">{label}</span>
            <kbd className="text-[10px] text-[#444] bg-[#1A1A1A] px-1.5 py-0.5 rounded font-mono">
              {shortcut}
            </kbd>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── SearchOverlay ──────────────────────────────────────────────────────────

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Reset state when overlay opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setHighlightedIndex(0);
    } else {
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Search Hook ───────────────────────────────────────────────────────────
  const {
    results,
    isLoading,
    isError,
    isEmpty,
  } = useSearch(
    debouncedQuery,
    undefined,
    MAX_RESULTS,
  );

  // ── Group results by model ────────────────────────────────────────────────
  const groupedResults: SearchGroup[] = useMemo(() => {
    const groups = new Map<SearchableModel, SearchResult[]>();
    results.forEach((r) => {
      const existing = groups.get(r.model);
      if (existing) {
        existing.push(r);
      } else {
        groups.set(r.model, [r]);
      }
    });

    return Array.from(groups.entries()).map(([model, items]) => ({
      model,
      label: MODEL_CONFIG[model].label,
      icon: MODEL_CONFIG[model].icon,
      color: MODEL_CONFIG[model].color,
      results: items,
    }));
  }, [results]);

  // ── Flatten results for keyboard navigation ───────────────────────────────
  const flatResults = useMemo(() => results, [results]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  // ── Keyboard Navigation ───────────────────────────────────────────────────
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      if (result.url) {
        window.location.href = result.url;
      }
      onClose();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0,
          );
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1,
          );
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (flatResults[highlightedIndex]) {
            handleSelectResult(flatResults[highlightedIndex]);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onClose();
          break;
        }
        default:
          break;
      }
    },
    [flatResults, highlightedIndex, handleSelectResult, onClose],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const highlighted = resultsContainerRef.current.querySelector(
        '[aria-selected="true"]',
      );
      highlighted?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const hasQuery = debouncedQuery.length >= 2;
  const showResults = hasQuery && !isLoading;
  const showEmpty = hasQuery && !isLoading && (isEmpty || isError);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[560px] max-h-[60vh] mx-4 bg-[#141414] border border-[#1F1F1F] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1F1F1F]">
              <Search size={17} className="text-[#555] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across your workspace..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#555] font-light outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-[#555] hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-[#444] bg-[#1A1A1A] px-2 py-1 rounded-md font-mono font-medium border border-[#1F1F1F]">
                <span className="text-[12px]">⌘</span>K
              </kbd>
            </div>

            {/* Results Area */}
            <div
              ref={resultsContainerRef}
              className="flex-1 overflow-y-auto scrollbar-thin"
              role="listbox"
            >
              {/* Loading State */}
              {isLoading && <SearchSkeleton />}

              {/* Empty / Error State */}
              {showEmpty && (
                <SearchEmptyState
                  hasQuery={hasQuery}
                  hasError={isError}
                />
              )}

              {/* Initial / No Query State */}
              {!hasQuery && !isLoading && (
                <SearchEmptyState hasQuery={false} hasError={false} />
              )}

              {/* Results */}
              {showResults && groupedResults.length > 0 && (
                <div className="py-2">
                  {groupedResults.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.model}>
                        <div className="flex items-center gap-2 px-4 py-2">
                          <GroupIcon size={12} className={group.color} />
                          <span className="text-[10px] uppercase tracking-[0.15em] text-[#444] font-semibold">
                            {group.label}
                          </span>
                          <span className="text-[10px] text-[#333]">
                            {group.results.length}
                          </span>
                        </div>
                        {group.results.map((result) => {
                          const flatIndex = flatResults.indexOf(result);
                          return (
                            <SearchResultItem
                              key={`${result.model}-${result.id}`}
                              result={result}
                              isHighlighted={flatIndex === highlightedIndex}
                              onSelect={handleSelectResult}
                              onHover={() => setHighlightedIndex(flatIndex)}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1F1F1F] bg-[#0A0A0A]/30">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] text-[#444]">
                  <ArrowUp size={11} />
                  <ArrowDown size={11} />
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-[#444]">
                  <CornerDownLeft size={11} />
                  <span>Select</span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-[#444]">
                  <span className="text-[11px]">Esc</span>
                  <span>Close</span>
                </span>
              </div>
              {debouncedQuery.length >= 2 && !isLoading && (
                <span className="text-[10px] text-[#444]">
                  {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── useSearchHotkey Hook ───────────────────────────────────────────────────

/**
 * Registers Ctrl+K / Cmd+K global listener.
 * Returns `isOpen` and `open`/`close`/`toggle` helpers.
 */
export function useSearchHotkey() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, open, close, toggle };
}
