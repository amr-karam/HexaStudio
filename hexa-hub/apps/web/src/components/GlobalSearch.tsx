'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FolderKanban, Users, FileText, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/components/ui/cn';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'project' | 'task' | 'document' | 'contact' | 'message';
  url: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function GlobalSearch({
  open,
  onClose,
  results = [],
  className,
}: {
  open: boolean;
  onClose: () => void;
  results?: SearchResult[];
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(-1);
    }
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      window.location.href = results[activeIndex].url;
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [activeIndex, results, onClose]);

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
      project: 'text-blue-400',
      task: 'text-amber-400',
      document: 'text-emerald-400',
      contact: 'text-purple-400',
      message: 'text-[#D4A843]',
    };
    return colors[category];
  };

  // Mock results for demo
  const mockResults: SearchResult[] = [
    { id: '1', title: 'Brand Refresh v2', subtitle: 'Sarah Chen', category: 'project', url: '/dashboard/projects/1' },
    { id: '2', title: 'Q3 Financial Report', subtitle: 'John Doe', category: 'document', url: '/dashboard/documents/2' },
    { id: '3', title: 'Weekly Team Standup', subtitle: 'Alice Williams', category: 'message', url: '/dashboard/messages/3' },
    { id: '4', title: 'API Integration', subtitle: 'Bob Johnson', category: 'task', url: '/dashboard/tasks/4' },
    { id: '5', title: 'Mike Johnson', subtitle: 'TechCorp Solutions', category: 'contact', url: '/dashboard/contacts/5' },
    { id: '6', title: 'Design System Update', subtitle: 'Design Team', category: 'project', url: '/dashboard/projects/6' },
    { id: '7', title: 'Onboarding Checklist', subtitle: 'HR Dept', category: 'document', url: '/dashboard/documents/7' },
    { id: '8', title: 'Meeting with Client', subtitle: 'Sarah Chen', category: 'message', url: '/dashboard/messages/8' },
  ];

  const filteredResults = query
    ? mockResults.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  const displayResults = query ? filteredResults : mockResults.slice(0, 4);

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
            <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Search Input */}
              <div className="relative p-4 border-b border-[#1F1F1F]">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, tasks, documents, contacts..."
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#555] focus:border-[#D4A843]/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#555] hover:text-white rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query && filteredResults.length === 0 ? (
                  <div className="p-6 text-center">
                    <Search size={40} className="text-[#333] mx-auto mb-2" />
                    <p className="text-sm text-[#555]">No results found for &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1F1F1F]">
                    {displayResults.map((result, index) => {
                      const Icon = getCategoryIcon(result.category);
                      const color = getCategoryColor(result.category);
                      return (
                        <motion.a
                          key={result.id}
                          href={result.url}
                          initial={{ backgroundColor: 'transparent' }}
                          whileHover={{ backgroundColor: '#D4A843/5' }}
                          onClick={() => onClose()}
                          className={cn(
                            'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                            index === activeIndex && 'bg-[#D4A843]/10 border-l-2 border-[#D4A843]'
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color.replace('text-', 'bg-').replace('-400', '/10'))}>
                            <Icon size={16} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-white truncate">{result.title}</p>
                              <span className={cn('text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full', color.replace('text-', 'bg-').replace('-400', '/10'), color)}>
                                {getCategoryLabel(result.category)}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#555]">{result.subtitle}</p>
                          </div>
                          <ChevronRight size={14} className="text-[#555] ml-2" />
                        </motion.a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#1F1F1F] bg-[#0A0A0A]">
                <div className="flex items-center justify-between px-3 text-[10px] text-[#555]">
                  <div className="flex items-center gap-3">
                    <span>Press ↭ to navigate</span>
                    <span>↵ to select</span>
                    <span>esc to close</span>
                  </div>
                  <div className="text-[#666]">
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