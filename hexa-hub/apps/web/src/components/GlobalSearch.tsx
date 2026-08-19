'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FolderKanban, Users, FileText, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/components/ui/cn';

// --- Types ---

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'project' | 'task' | 'document' | 'contact' | 'message';
  url: string;
}

interface RawSearchItem {
  id: string | number;
  title?: string;
  subtitle?: string;
  model?: string;
}

// --- Component ---

export default function GlobalSearch({
  open,
  onClose,
  className,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(-1);
      setApiResults([]);
    }
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setApiResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch('/api/v1/search?q=' + encodeURIComponent(searchQuery));
      if (res.ok) {
        const data = await res.json();
        const mapped: SearchResult[] = (data.data || []).map((item: RawSearchItem) => ({
          id: String(item.id),
          title: item.title || 'Untitled',
          subtitle: item.subtitle || '',
          category: item.model?.includes('project') ? 'project'
            : item.model?.includes('task') ? 'task'
            : item.model?.includes('document') ? 'document'
            : 'contact',
          url: item.model?.includes('project') ? '/dashboard/projects/' + item.id
            : item.model?.includes('task') ? '/dashboard/tasks/' + item.id
            : item.model?.includes('document') ? '/dashboard/documents/' + item.id
            : '/dashboard/contacts/' + item.id,
        }));
        setApiResults(mapped);
      }
    } catch {
      // Silently fail - keep empty results
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, apiResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && apiResults[activeIndex]) {
      window.location.href = apiResults[activeIndex].url;
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [activeIndex, apiResults, onClose]);

  const getCategoryIcon = (category: SearchResult['category']) => {
    const icons = {
      project: FolderKanban,
      task: FileText,
      document: FileText,
      contact: Users,
      message: MessageSquare,
    };
    return icons[category];
  };

  const getCategoryLabel = (category: SearchResult['category']) => {
    const labels = {
      project: 'Project',
      task: 'Task',
      document: 'Document',
      contact: 'Contact',
      message: 'Message',
    };
    return labels[category];
  };

  const getCategoryColor = (category: SearchResult['category']) => {
    const colors = {
      project: 'text-info',
      task: 'text-amber-400',
      document: 'text-success',
      contact: 'text-purple-400',
      message: 'text-gold',
    };
    return colors[category];
  };

  const displayResults = query ? apiResults : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn('fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto', className)}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-surface border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Search Input */}
              <div className="relative p-4 border-b border-border">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-tertiary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, tasks, documents, contacts..."
                  className="w-full bg-void-deep border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-tertiary focus:border-gold/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-tertiary hover:text-foreground rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-tertiary">Searching...</p>
                  </div>
                ) : query && displayResults.length === 0 ? (
                  <div className="p-6 text-center">
                    <Search size={40} className="text-tertiary mx-auto mb-2" />
                    <p className="text-sm text-tertiary">No results found for &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {displayResults.map((result, index) => {
                      const Icon = getCategoryIcon(result.category);
                      const color = getCategoryColor(result.category);
                      return (
                        <motion.a
                          key={result.id}
                          href={result.url}
                          initial={{ backgroundColor: 'transparent' }}
                          whileHover={{ backgroundColor: 'var(--color-gold)' }}
                          onClick={() => onClose()}
                          className={cn(
                            'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                            index === activeIndex && 'bg-gold/10 border-l-2 border-gold'
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color.replace('text-', 'bg-').replace('-400', '/10'))}>
                            <Icon size={16} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                              <span className={cn('text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full', color.replace('text-', 'bg-').replace('-400', '/10'), color)}>
                                {getCategoryLabel(result.category)}
                              </span>
                            </div>
                            <p className="text-[11px] text-tertiary">{result.subtitle}</p>
                          </div>
                          <ChevronRight size={14} className="text-tertiary ml-2" />
                        </motion.a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-void-deep">
                <div className="flex items-center justify-between px-3 text-[10px] text-tertiary">
                  <div className="flex items-center gap-3">
                    <span>Press ArrowDown/Up to navigate</span>
                    <span>Enter to select</span>
                    <span>Esc to close</span>
                  </div>
                  <div className="text-tertiary">
                    {displayResults.length} result{displayResults.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
