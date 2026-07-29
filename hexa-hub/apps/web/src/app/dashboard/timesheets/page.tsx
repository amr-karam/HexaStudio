'use client';

import React, { useState } from 'react';
import { useTimesheets, useTimesheetStats } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Clock,
  Search,
  Plus,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import type { ExportColumn } from '@/components/ExportButton';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TimesheetEntry {
  id: number;
  employee_name: string;
  project_name: string;
  task_name: string;
  description: string;
  hours: number;
  date: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const EMPLOYEE_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All Employees' },
  { value: '1', label: 'John Smith' },
  { value: '2', label: 'Sarah Johnson' },
  { value: '3', label: 'Mike Chen' },
  { value: '4', label: 'Emily Davis' },
];

const PROJECT_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All Projects' },
  { value: '1', label: 'Skyline Tower' },
  { value: '2', label: 'Riverside Mall' },
  { value: '3', label: 'City Park Renovation' },
  { value: '4', label: 'Harbor Bridge' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatHours(hours: number): string {
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
}

// ─── Export Columns ─────────────────────────────────────────────────────────

const timesheetExportColumns: ExportColumn[] = [
  { header: 'Employee', key: 'employee_name', format: (val: unknown) => String(val ?? '—') },
  { header: 'Project', key: 'project_name', format: (val: unknown) => String(val ?? '—') },
  { header: 'Task', key: 'task_name', format: (val: unknown) => String(val ?? '—') },
  { header: 'Description', key: 'description', format: (val: unknown) => String(val ?? '—') },
  { header: 'Hours', key: 'hours', format: (val: unknown) => formatHours(Number(val ?? 0)) },
  { header: 'Date', key: 'date', format: (val: unknown) =>
    val ? formatDate(String(val)) : '—' },
];

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

export default function TimesheetsPage() {
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
  if (employeeFilter) filters.employee_id = employeeFilter;
  if (projectFilter) filters.project_id = projectFilter;
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;

  const {
    data: entries,
    isLoading,
    isError,
    total,
    totalPages,
  } = useTimesheets(filters);

  const {
    data: stats,
  } = useTimesheetStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const resolvedEntries = (entries ?? []) as TimesheetEntry[];
  const resolvedTotal = total ?? 0;
  const resolvedTotalPages = totalPages ?? 1;

  // Use stats from the API when available, fallback to local calculation
  const typedStats = stats as { total_hours?: number; total_entries?: number; unique_employees?: number } | undefined;
  const totalHours = typedStats?.total_hours ?? resolvedEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const statsEntries = typedStats?.total_entries ?? resolvedTotal;
  const uniqueEmployees = typedStats?.unique_employees;

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
          <Clock size={13} />
          <span>Timesheets</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Timesheets
            </h1>
            <p className="text-[13px] text-neutral-500 font-light">
              {resolvedTotal} time entries
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] text-sm font-light tracking-wide rounded-lg hover:bg-[#D4A843]/90 hover:shadow-[0_0_20px_rgba(212,168,67,0.15)] transition-all duration-300">
            <Plus size={15} />
            Log Time
          </button>
        </div>
      </motion.div>

      {/* Summary Card */}
      {!isLoading && !isError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-5 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-1.5 font-medium">
              Total Hours
            </p>
            <p className="text-2xl font-serif font-light text-[#D4A843]">
              {formatHours(totalHours)}
            </p>
          </div>
          <div className="p-5 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-1.5 font-medium">
              Entries
            </p>
            <p className="text-2xl font-serif font-light text-white">
              {statsEntries}
            </p>
          </div>
          <div className="p-5 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-1.5 font-medium">
              Avg Hours/Entry
            </p>
            <p className="text-2xl font-serif font-light text-emerald-400">
              {resolvedEntries.length > 0
                ? formatHours(Math.round((totalHours / resolvedEntries.length) * 10) / 10)
                : '0'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-3 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
          />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-neutral-600 font-light focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20 transition-all duration-300"
          />
        </div>

        {/* Employee Filter */}
        <div className="relative">
          <User
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          />
          <select
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-9 pr-8 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
          >
            {EMPLOYEE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
        </div>

        {/* Project Filter */}
        <div className="relative">
          <Briefcase
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          />
          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-9 pr-8 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
          >
            {PROJECT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
            title="From date"
          />
          <span className="text-neutral-600 text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
            title="To date"
          />
        </div>

        {/* Export Button */}
        <ExportButton
          data={(resolvedEntries as unknown as Record<string, unknown>[]) ?? []}
          columns={timesheetExportColumns}
          filename="timesheets-export"
          format="csv"
          label="Export"
        />
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
          <span className="text-[12px] text-neutral-600 font-light tracking-wide">
            Loading timesheets...
          </span>
        </div>
      ) : isError ? (
        <div className="p-16 text-center">
          <AlertCircle size={32} className="text-red-400/60 mx-auto mb-3" />
          <p className="text-red-400 text-sm font-light">
            Failed to load timesheets.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            Please check your connection and try again.
          </p>
        </div>
      ) : resolvedEntries.length === 0 ? (
        <div className="p-16 text-center">
          <Clock size={32} className="text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm font-light">
            No time entries found.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            {debouncedSearch ||
            employeeFilter ||
            projectFilter ||
            dateFrom ||
            dateTo
              ? 'Try adjusting your filters.'
              : 'Click "Log Time" to record your first entry.'}
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
                    Employee
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Project
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Task
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Description
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Hours
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Date
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={rowContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {resolvedEntries.map((entry) => (
                  <motion.tr
                    key={entry.id}
                    variants={rowVariants}
                    className="border-b border-[#1F1F1F]/50 last:border-0 hover:bg-white/[0.02] transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-white font-light">
                        <span className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#1F1F1F] flex items-center justify-center text-[10px] font-medium text-neutral-400 shrink-0">
                          {entry.employee_name
                            ?.split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || '?'}
                        </span>
                        {entry.employee_name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-400 font-light">
                        {entry.project_name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-400 font-light">
                        {entry.task_name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <span className="text-sm text-neutral-500 font-light truncate block">
                        {entry.description || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-[#D4A843] font-medium tabular-nums">
                        {formatHours(entry.hours)}h
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-[12px] text-neutral-500 font-light">
                        <Calendar size={11} className="text-neutral-600" />
                        {entry.date ? formatDate(entry.date) : '—'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && resolvedEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <span className="text-[12px] text-neutral-500 font-light">
            Page {page} of {resolvedTotalPages} &middot; {resolvedTotal} entries
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
