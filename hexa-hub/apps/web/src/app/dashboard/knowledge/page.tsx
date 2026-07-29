'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useKnowledgeArticles } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Clock,
  AlertCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface KnowledgeArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  updated_at: string;
}

type Category = 'all' | 'guides' | 'faqs' | 'policies' | 'templates' | 'reference';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_TABS: { value: Category; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '' },
  { value: 'guides', label: 'Guides', icon: '' },
  { value: 'faqs', label: 'FAQs', icon: '' },
  { value: 'policies', label: 'Policies', icon: '' },
  { value: 'templates', label: 'Templates', icon: '' },
  { value: 'reference', label: 'Reference', icon: '' },
];

const CATEGORY_COLORS: Record<string, string> = {
  guides: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  faqs: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  policies: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  templates: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reference: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(isoStr: string): string {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(isoStr);
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [categoryTab, setCategoryTab] = useState<Category>('all');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: Record<string, unknown> = { page, limit: 24 };
  if (debouncedSearch) filters.search = debouncedSearch;
  if (categoryTab !== 'all') filters.category = categoryTab;

  const {
    data: articles,
    isLoading,
    isError,
    total,
    totalPages,
  } = useKnowledgeArticles(filters);

  const resolvedArticles = useMemo(() => (articles ?? []) as KnowledgeArticle[], [articles]);
  const resolvedTotal = total ?? 0;
  const resolvedTotalPages = totalPages ?? 1;

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resolvedArticles.forEach((a) => {
      const cat = a.category?.toLowerCase() || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [resolvedArticles]);

  // When "all" is selected, use the total from the response as the count
  const getCategoryCount = (cat: Category): number | null => {
    if (cat === 'all') return resolvedTotal;
    return categoryCounts[cat] || 0;
  };

  return (
    <div className="p-8 md:p-10 lg:p-12 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-4">
          <BookOpen size={13} />
          <span>Knowledge Base</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Knowledge Base
            </h1>
            <p className="text-[13px] text-neutral-500 font-light">
              {resolvedTotal} articles
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 space-y-4"
      >
        {/* Search */}
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-neutral-600 font-light focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20 transition-all duration-300"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_TABS.map((tab) => {
            const count = getCategoryCount(tab.value);
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setCategoryTab(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-light transition-all duration-200 ${
                  categoryTab === tab.value
                    ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30'
                    : 'text-neutral-500 border border-transparent hover:text-neutral-300 hover:border-[#1F1F1F]'
                }`}
              >
                {tab.label}
                {count !== null && categoryTab === tab.value && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-5 animate-pulse"
            >
              <div className="h-5 bg-[#1F1F1F] rounded w-20 mb-3" />
              <div className="h-4 bg-[#1F1F1F] rounded w-full mb-2" />
              <div className="h-4 bg-[#1F1F1F] rounded w-3/4 mb-4" />
              <div className="h-3 bg-[#1F1F1F] rounded w-24" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-16 text-center">
          <AlertCircle size={32} className="text-red-400/60 mx-auto mb-3" />
          <p className="text-red-400 text-sm font-light">
            Failed to load articles.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            Please check your connection and try again.
          </p>
        </div>
      ) : resolvedArticles.length === 0 ? (
        <div className="p-16 text-center">
          <BookOpen size={32} className="text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm font-light">
            No articles found.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            {debouncedSearch || categoryTab !== 'all'
              ? 'Try adjusting your filters.'
              : 'Articles will appear once the knowledge base is populated.'}
          </p>
        </div>
      ) : (
        /* ─── Article Card Grid ──────────────────────────────────────── */
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {resolvedArticles.map((article) => {
            const catColor =
              CATEGORY_COLORS[article.category?.toLowerCase()] ??
              CATEGORY_COLORS.reference;

            return (
              <motion.div
                key={article.id}
                variants={cardVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() =>
                  router.push(`/dashboard/knowledge/${article.id}`)
                }
                className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer group hover:border-[#D4A843]/20 transition-all duration-300 flex flex-col"
              >
                {/* Category Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.1em] border ${catColor}`}
                  >
                    {article.category || 'Reference'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] text-white font-light mb-2 group-hover:text-[#D4A843] transition-colors duration-200 line-clamp-1">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[12px] text-neutral-500 font-light leading-relaxed mb-4 line-clamp-2 flex-1">
                  {article.excerpt ||
                    'No excerpt available for this article.'}
                </p>

                {/* Footer — Last Updated */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-[#1F1F1F]/50">
                  <Clock size={11} className="text-neutral-600" />
                  <span className="text-[11px] text-neutral-600 font-light">
                    Updated {article.updated_at
                      ? formatRelativeDate(article.updated_at)
                      : 'recently'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && resolvedArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <span className="text-[12px] text-neutral-500 font-light">
            Page {page} of {resolvedTotalPages} &middot; {resolvedTotal} articles
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-neutral-400 bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-light"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                className="rotate-180"
              >
                <path
                  d="M5 3.5L8 6.5L5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(resolvedTotalPages, p + 1))}
              disabled={page >= resolvedTotalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-neutral-400 bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-light"
            >
              Next
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
              >
                <path
                  d="M5 3.5L8 6.5L5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
