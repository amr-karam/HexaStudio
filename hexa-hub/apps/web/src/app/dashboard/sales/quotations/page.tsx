'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { OdooQuotation, QuotationState } from '@hexa-hub/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuotationFilters {
  search: string;
  status: QuotationState | '';
}

interface PaginatedResponse {
  content: OdooQuotation[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  [QuotationState.DRAFT]: {
    label: 'Draft',
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    dot: 'bg-neutral-400',
  },
  [QuotationState.SENT]: {
    label: 'Sent',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  [QuotationState.ACCEPTED]: {
    label: 'Accepted',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  [QuotationState.CANCELLED]: {
    label: 'Cancelled',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  [QuotationState.SALES_ORDER]: {
    label: 'Sales Order',
    bg: 'bg-[#D4A843]/10',
    text: 'text-[#D4A843]',
    dot: 'bg-[#D4A843]',
  },
};

const STATUS_OPTIONS: { value: QuotationState | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: QuotationState.DRAFT, label: 'Draft' },
  { value: QuotationState.SENT, label: 'Sent' },
  { value: QuotationState.ACCEPTED, label: 'Accepted' },
  { value: QuotationState.CANCELLED, label: 'Cancelled' },
  { value: QuotationState.SALES_ORDER, label: 'Sales Order' },
];

const PAGE_SIZE = 15;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currencySymbol = '$'): string {
  return `${currencySymbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function QuotationsPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [filters, setFilters] = useState<QuotationFilters>({
    search: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchQuotations = useCallback(async (): Promise<PaginatedResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: PAGE_SIZE.toString(),
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.status) params.set('status', filters.status);

    const res = await axios.get<PaginatedResponse>(
      `${API_URL}/odoo/quotations?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }, [page, debouncedSearch, filters.status, token]);

  const { data, isLoading, isError } = useQuery<PaginatedResponse>({
    queryKey: ['quotations', debouncedSearch, filters.status, page],
    queryFn: fetchQuotations,
    staleTime: 60_000,
    enabled: !!token,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const quotations = data?.content ?? [];

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value as QuotationState | '' }));
    setPage(1);
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
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#666] mb-4">
          <FileText size={13} />
          <span>Sales / Quotations</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Quotations
            </h1>
            <p className="text-[13px] text-[#666] font-light">
              {data?.total ?? 0} total quotations
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium tracking-wide transition-shadow hover:shadow-[0_0_20px_rgba(212,168,67,0.15)]"
          >
            <Plus size={16} />
            New Quotation
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
          />
          <input
            type="text"
            placeholder="Search by name or client..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-[#555] font-light focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20 transition-all duration-300"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none"
          />
          <select
            value={filters.status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownSmall className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#141414] border border-[#1F1F1F] rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
            <span className="text-[12px] text-[#555] font-light tracking-wide">
              Loading quotations...
            </span>
          </div>
        ) : isError ? (
          <div className="p-16 text-center">
            <p className="text-red-400 text-sm">Failed to load quotations.</p>
            <p className="text-[#555] text-xs mt-1">
              Please check your connection and try again.
            </p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={32} className="text-[#333] mx-auto mb-3" />
            <p className="text-[#555] text-sm">No quotations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    <span className="flex items-center gap-1.5">
                      Name <ArrowUpDown size={11} className="text-[#444]" />
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Client
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Amount
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Date
                  </th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {quotations.map((q) => {
                  const statusCfg =
                    STATUS_CONFIG[q.state] ?? STATUS_CONFIG.draft;
                  return (
                    <motion.tr
                      key={q.id}
                      variants={rowVariants}
                      onClick={() =>
                        router.push(`/dashboard/sales/quotations/${q.id}`)
                      }
                      className="border-b border-[#1F1F1F]/50 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-light group-hover:text-[#D4A843] transition-colors duration-200">
                          {q.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#999] font-light">
                          {q.partner_id?.[1] ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-white font-light tabular-nums">
                          {formatCurrency(q.amount_total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                          />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#777] font-light">
                          {formatDate(q.date_order)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {quotations.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1F1F1F]">
            <span className="text-[12px] text-[#555] font-light">
              Page {page} of {totalPages} &middot; {data?.total ?? 0} quotations
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-[#888] bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft size={13} />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-[#888] bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Inline Helper Component ────────────────────────────────────────────────

function ChevronDownSmall({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
