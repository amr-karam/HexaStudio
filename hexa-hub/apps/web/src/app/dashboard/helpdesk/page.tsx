'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHelpdeskTickets } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  MessageSquareMore,
  Search,
  Plus,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  Filter,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface HelpdeskTicket {
  id: number;
  subject: string;
  customer_name: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  stage: string;
  assigned_to_name: string;
  created_at: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  high: {
    label: 'High',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  low: {
    label: 'Low',
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    dot: 'bg-neutral-500',
  },
};

const STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Stages' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_customer', label: 'Waiting on Customer' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const rowContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function HelpdeskPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: Record<string, unknown> = { page, limit: 20 };
  if (debouncedSearch) filters.search = debouncedSearch;
  if (stageFilter) filters.stage = stageFilter;

  const {
    data: tickets,
    isLoading,
    isError,
    total,
    totalPages,
  } = useHelpdeskTickets(filters);

  const resolvedTickets = (tickets ?? []) as HelpdeskTicket[];
  const resolvedTotal = total ?? 0;
  const resolvedTotalPages = totalPages ?? 1;

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
          <MessageSquareMore size={13} />
          <span>Helpdesk</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Helpdesk
            </h1>
            <p className="text-[13px] text-neutral-500 font-light">
              {resolvedTotal} support tickets
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] text-sm font-light tracking-wide rounded-lg hover:bg-[#D4A843]/90 hover:shadow-[0_0_20px_rgba(212,168,67,0.15)] transition-all duration-300">
            <Plus size={15} />
            New Ticket
          </button>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
          />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-neutral-600 font-light focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20 transition-all duration-300"
          />
        </div>
        <div className="relative">
          <Filter
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          />
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-9 pr-8 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
          <span className="text-[12px] text-neutral-600 font-light tracking-wide">
            Loading tickets...
          </span>
        </div>
      ) : isError ? (
        <div className="p-16 text-center">
          <AlertCircle size={32} className="text-red-400/60 mx-auto mb-3" />
          <p className="text-red-400 text-sm font-light">
            Failed to load tickets.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            Please check your connection and try again.
          </p>
        </div>
      ) : resolvedTickets.length === 0 ? (
        <div className="p-16 text-center">
          <MessageSquareMore
            size={32}
            className="text-neutral-700 mx-auto mb-3"
          />
          <p className="text-neutral-500 text-sm font-light">
            No tickets found.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            {debouncedSearch || stageFilter
              ? 'Try adjusting your filters.'
              : 'Create a new ticket to get started.'}
          </p>
        </div>
      ) : (
        /* ─── Table View ──────────────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Subject
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Customer
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Priority
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Stage
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Assigned To
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Created
                  </th>
                  <th className="w-10 px-6 py-3.5" />
                </tr>
              </thead>
              <motion.tbody
                variants={rowContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {resolvedTickets.map((ticket) => {
                  const priorityCfg =
                    PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.low;

                  return (
                    <motion.tr
                      key={ticket.id}
                      variants={rowVariants}
                      onClick={() =>
                        router.push(`/dashboard/helpdesk/${ticket.id}`)
                      }
                      className="border-b border-[#1F1F1F]/50 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-light group-hover:text-[#D4A843] transition-colors duration-200">
                          {ticket.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-400 font-light">
                          {ticket.customer_name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-[0.1em] ${priorityCfg.bg} ${priorityCfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`}
                          />
                          {priorityCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] text-neutral-400 font-light capitalize">
                          {(ticket.stage || 'new').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assigned_to_name ? (
                          <span className="inline-flex items-center gap-2 text-sm text-neutral-400 font-light">
                            <span className="w-6 h-6 rounded-full bg-[#D4A843]/10 text-[#D4A843] text-[10px] font-medium flex items-center justify-center shrink-0">
                              {getInitials(ticket.assigned_to_name)}
                            </span>
                            {ticket.assigned_to_name}
                          </span>
                        ) : (
                          <span className="text-[12px] text-neutral-600">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[12px] text-neutral-500 font-light">
                          <Clock size={11} className="text-neutral-600" />
                          {ticket.created_at
                            ? formatDate(ticket.created_at)
                            : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight
                          size={14}
                          className="text-neutral-700 group-hover:text-[#D4A843] transition-colors duration-200"
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && resolvedTickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <span className="text-[12px] text-neutral-500 font-light">
            Page {page} of {resolvedTotalPages} &middot; {resolvedTotal} tickets
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-neutral-400 bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-light"
            >
              <ChevronRight size={13} className="rotate-180" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(resolvedTotalPages, p + 1))}
              disabled={page >= resolvedTotalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-neutral-400 bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-light"
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Inline Helper ──────────────────────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
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
