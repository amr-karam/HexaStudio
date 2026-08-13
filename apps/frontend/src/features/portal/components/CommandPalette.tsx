'use client';

/**
 * HEXA Portal — Command Palette
 *
 * Full-screen overlay triggered by Ctrl/Cmd+K or search bar click.
 * Features: fuzzy search, keyboard navigation, categories, recent searches,
 * beautiful scale + fade animation.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePortalStore } from '../store';
import { Icon, type IconName } from './PortalIcons';
import { overlay, modalPanel } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { CommandItem, CommandCategory } from '../types';

/* -------------------------------------------------------------------------- */
/*  Static Command Data                                                       */
/* -------------------------------------------------------------------------- */

const COMMAND_ITEMS: CommandItem[] = [
  // Projects
  { id: 'projects', category: 'projects', label: 'View Projects', description: 'Browse all active projects', href: '/portal/projects', icon: 'folder-kanban' },
  { id: 'project-detail', category: 'projects', label: 'Project Details', description: 'View project progress and milestones', href: '/portal/projects', icon: 'eye' },

  // Documents
  { id: 'documents', category: 'documents', label: 'View Documents', description: 'Browse your document vault', href: '/portal/documents', icon: 'file-text' },
  { id: 'upload-doc', category: 'documents', label: 'Upload Document', description: 'Upload a new document', href: '/portal/documents', icon: 'upload' },

  // Invoices
  { id: 'invoices', category: 'invoices', label: 'View Invoices', description: 'Browse all invoices', href: '/portal/finance', icon: 'receipt' },
  { id: 'outstanding', category: 'invoices', label: 'Outstanding Invoices', description: 'View pending payments', href: '/portal/finance', icon: 'dollar-sign' },

  // Messages
  { id: 'messages', category: 'messages', label: 'View Messages', description: 'Read and send messages', href: '/portal/chat', icon: 'message-square' },
  { id: 'new-message', category: 'messages', label: 'New Message', description: 'Compose a new message', href: '/portal/chat', icon: 'send' },

  // Settings
  { id: 'settings', category: 'settings', label: 'Settings', description: 'Manage your account settings', href: '/portal/settings', icon: 'settings' },
  { id: 'profile', category: 'settings', label: 'Edit Profile', description: 'Update your profile information', href: '/portal/settings', icon: 'user' },
];

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  projects: 'Projects',
  documents: 'Documents',
  invoices: 'Invoices',
  messages: 'Messages',
  settings: 'Settings',
};

const CATEGORY_ICONS: Record<CommandCategory, IconName> = {
  projects: 'folder-kanban',
  documents: 'file-text',
  invoices: 'receipt',
  messages: 'message-square',
  settings: 'settings',
};

const RECENT_KEY = 'hexa-command-palette-recent';
const MAX_RECENT = 5;

/* -------------------------------------------------------------------------- */
/*  Fuzzy Search                                                              */
/* -------------------------------------------------------------------------- */

function fuzzyScore(query: string, text: string): number {
  const lower = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match
  if (lowerText === lower) return 100;
  // Starts with
  if (lowerText.startsWith(lower)) return 90;
  // Contains
  if (lowerText.includes(lower)) return 70;
  // Fuzzy match score
  let qi = 0;
  let score = 0;
  for (let ti = 0; ti < lowerText.length && qi < lower.length; ti++) {
    if (lowerText[ti] === lower[qi]) {
      score += lowerText[ti] === lower[qi] ? 10 : 5;
      qi++;
    }
  }
  return qi === lower.length ? score : 0;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = usePortalStore();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentIds(JSON.parse(stored) as string[]);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Filter + sort results
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent first, then all
      const recentItems = recentIds
        .map((id) => COMMAND_ITEMS.find((item) => item.id === id))
        .filter(Boolean) as CommandItem[];
      const otherItems = COMMAND_ITEMS.filter((item) => !recentIds.includes(item.id));
      return [...recentItems, ...otherItems];
    }

    return COMMAND_ITEMS
      .map((item) => ({
        item,
        score: fuzzyScore(query, `${item.label} ${item.description ?? ''} ${item.category}`),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [query, recentIds]);

  // Group by category
  const groupedResults = useMemo(() => {
    const groups = new Map<CommandCategory, CommandItem[]>();
    for (const item of results) {
      const existing = groups.get(item.category) ?? [];
      existing.push(item);
      groups.set(item.category, existing);
    }
    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => results, [results]);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isCommandPaletteOpen]);

  // Keyboard shortcut: Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Navigate with arrow keys
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setCommandPaletteOpen(false);
          break;
      }
    },
    [flatResults, selectedIndex, setCommandPaletteOpen],
  );

  const handleSelect = useCallback(
    (item: CommandItem) => {
      addRecent(item.id);
      setCommandPaletteOpen(false);
      router.push(item.href);
    },
    [addRecent, setCommandPaletteOpen, router],
  );

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
          {/* Backdrop */}
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={prefersReduced}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Panel */}
          <motion.div
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={prefersReduced}
            className={cn(
              'relative w-full max-w-xl mx-4',
              'artisan-glass artisan-specular-top rounded-2xl',
              'shadow-2xl shadow-black/40',
              'overflow-hidden',
            )}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 border-b border-border/20">
              <Icon name="search" size={18} className="text-neutral-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 h-14 bg-transparent text-foreground text-sm placeholder:text-neutral-600 outline-none"
                aria-label="Search commands"
                autoComplete="off"
              />
              <kbd className="text-[10px] font-mono text-neutral-600 border border-border/30 rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-80 overflow-y-auto p-2" role="listbox">
              {flatResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-neutral-500">No results found</p>
                  <p className="text-xs text-neutral-600 mt-1">Try a different search term</p>
                </div>
              ) : (
                Array.from(groupedResults.entries()).map(([category, items]) => (
                  <div key={category} className="mb-2">
                    {/* Category header */}
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <Icon name={CATEGORY_ICONS[category]} size={12} className="text-neutral-600" />
                      <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-mono">
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>

                    {/* Items */}
                    {items.map((item) => {
                      const globalIndex = flatResults.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={globalIndex}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors duration-150',
                            'focus-visible:outline-none',
                            isSelected
                              ? 'bg-accent/10 text-foreground'
                              : 'text-neutral-400 hover:bg-white/[0.03]',
                          )}
                        >
                          <Icon
                            name={item.icon as IconName}
                            size={16}
                            className={isSelected ? 'text-accent' : 'text-neutral-600'}
                          />
                          <div className="min-w-0">
                            <p className="text-sm truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-neutral-600 truncate">{item.description}</p>
                            )}
                          </div>
                          {isSelected && (
                            <Icon name="chevron-right" size={14} className="ml-auto text-accent shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/20">
              <div className="flex items-center gap-3 text-[10px] text-neutral-600 font-mono">
                <span className="flex items-center gap-1">
                  <kbd className="border border-border/30 rounded px-1 py-0.5">↑</kbd>
                  <kbd className="border border-border/30 rounded px-1 py-0.5">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-border/30 rounded px-1 py-0.5">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-border/30 rounded px-1 py-0.5">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
