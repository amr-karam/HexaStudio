/**
 * HEXA-NEW Command Palette
 * 
 * Quick navigation and action palette (Cmd+K / Ctrl+K)
 * Integrated with the existing portal navigation
 * 
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category?: 'navigation' | 'action' | 'settings';
  keywords?: string[];
}

interface CommandPaletteProps {
  items: CommandItem[];
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function CommandPalette({
  items,
  isOpen: controlledIsOpen,
  onOpenChange,
  placeholder = 'Search commands, pages, or actions...',
  className,
}: CommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = onOpenChange ?? setInternalIsOpen;

  const prefersReduced = useReducedMotion();

  // Filter items based on query
  const filteredItems = items.filter(item => {
    if (!query) return true;
    const searchText = query.toLowerCase();
    const matchesLabel = item.label.toLowerCase().includes(searchText);
    const matchesKeywords = item.keywords?.some(k => k.toLowerCase().includes(searchText));
    const matchesDescription = item.description?.toLowerCase().includes(searchText);
    return matchesLabel || matchesKeywords || matchesDescription;
  });

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [filteredItems, selectedIndex, setIsOpen]);

  // Global hotkey to open (Cmd+K on Mac, Ctrl+K on Windows/Linux)
  useKeyboardShortcut('k', () => {
    setIsOpen(true);
  }, { ctrlCmd: true });

  const handleItemClick = (item: CommandItem) => {
    item.action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg',
          'bg-surface-secondary/50 border border-border-subtle',
          'text-text-muted hover:text-text-primary',
          'transition-colors duration-200',
          'group',
          className
        )}
        aria-label="Open command palette"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm">{placeholder.split(' ')[0]}</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-surface-tertiary text-text-tertiary">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReduced ? 0.01 : 0.15 }}
              className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ 
                duration: prefersReduced ? 0.01 : 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="fixed left-1/2 top-[20vh] -translate-x-1/2 w-full max-w-xl z-50"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="bg-surface-primary border border-border-subtle rounded-xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                  <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary outline-none"
                    aria-label="Search commands"
                  />
                  <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-secondary text-text-tertiary border border-border-subtle">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {filteredItems.length === 0 ? (
                    <div className="px-4 py-8 text-center text-text-tertiary">
                      <p>No commands found</p>
                      <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    filteredItems.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          index === selectedIndex
                            ? 'bg-gold/10 text-gold'
                            : 'text-text-primary hover:bg-surface-secondary'
                        )}
                        role="option"
                        aria-selected={index === selectedIndex}
                      >
                        {item.icon && (
                          <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-sm text-text-tertiary truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.shortcut && (
                          <div className="flex items-center gap-1 text-text-tertiary">
                            {item.shortcut.map((key, i) => (
                              <kbd key={i} className="px-1.5 py-0.5 text-xs rounded bg-surface-secondary border border-border-subtle">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-border-subtle text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-surface-secondary">↑</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-surface-secondary">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-surface-secondary">↵</kbd>
                    to select
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default CommandPalette;