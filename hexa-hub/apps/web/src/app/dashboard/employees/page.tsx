'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEmployees } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Employee {
  id: number;
  name: string;
  job_title: string;
  department: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

type Department = 'all' | 'design' | 'engineering' | 'management' | 'sales' | 'admin';

// ─── Constants ──────────────────────────────────────────────────────────────

const DEPARTMENT_TABS: { value: Department; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'management', label: 'Management' },
  { value: 'sales', label: 'Sales' },
  { value: 'admin', label: 'Admin' },
];

const DEPARTMENT_COLORS: Record<string, string> = {
  design: 'bg-violet-500/10 text-violet-400',
  engineering: 'bg-blue-500/10 text-blue-400',
  management: 'bg-[#D4A843]/10 text-[#D4A843]',
  sales: 'bg-emerald-500/10 text-emerald-400',
  admin: 'bg-neutral-500/10 text-neutral-400',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getDepartmentColor(department: string): string {
  const key = department?.toLowerCase().replace(/\s+/g, '_');
  return DEPARTMENT_COLORS[key] ?? 'bg-neutral-500/10 text-neutral-400';
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

export default function EmployeesPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [departmentTab, setDepartmentTab] = useState<Department>('all');
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
  if (departmentTab !== 'all') filters.department = departmentTab;

  const {
    data: employees,
    isLoading,
    isError,
    total,
    totalPages,
  } = useEmployees(filters);

  const resolvedEmployees = useMemo(() => (employees ?? []) as Employee[], [employees]);
  const resolvedTotal = total ?? 0;
  const resolvedTotalPages = totalPages ?? 1;

  // Count per department (from all loaded data or server count)
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resolvedEmployees.forEach((emp) => {
      const dept = emp.department?.toLowerCase() || 'unknown';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  }, [resolvedEmployees]);

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
          <Users size={13} />
          <span>Team</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Employees
            </h1>
            <p className="text-[13px] text-neutral-500 font-light">
              {resolvedTotal} team members
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
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-neutral-600 font-light focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20 transition-all duration-300"
          />
        </div>

        {/* Department Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {DEPARTMENT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setDepartmentTab(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-light transition-all duration-200 ${
                departmentTab === tab.value
                  ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30'
                  : 'text-neutral-500 border border-transparent hover:text-neutral-300 hover:border-[#1F1F1F]'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && departmentTab === tab.value && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({departmentCounts[tab.value] || 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-5 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1F1F1F]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1F1F1F] rounded w-24" />
                  <div className="h-2.5 bg-[#1F1F1F] rounded w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-[#1F1F1F] rounded w-32" />
                <div className="h-2 bg-[#1F1F1F] rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-16 text-center">
          <AlertCircle size={32} className="text-red-400/60 mx-auto mb-3" />
          <p className="text-red-400 text-sm font-light">
            Failed to load employees.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            Please check your connection and try again.
          </p>
        </div>
      ) : resolvedEmployees.length === 0 ? (
        <div className="p-16 text-center">
          <Users size={32} className="text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm font-light">
            No employees found.
          </p>
          <p className="text-neutral-600 text-xs mt-1 font-light">
            {debouncedSearch || departmentTab !== 'all'
              ? 'Try adjusting your filters.'
              : 'Employee records will appear once synchronized with Odoo.'}
          </p>
        </div>
      ) : (
        /* ─── Employee Card Grid ─────────────────────────────────────── */
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {resolvedEmployees.map((employee) => {
            const deptColor = getDepartmentColor(employee.department);

            return (
              <motion.div
                key={employee.id}
                variants={cardVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() =>
                  router.push(`/dashboard/employees/${employee.id}`)
                }
                className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer group hover:border-[#D4A843]/20 transition-all duration-300"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#1F1F1F] flex items-center justify-center shrink-0 group-hover:border-[#D4A843]/20 transition-colors duration-300">
                    {employee.avatar_url ? (
                      <Image
                        src={employee.avatar_url}
                        alt={employee.name}
                        width={48}
                        height={48}
                        className="w-full h-full rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-[14px] font-medium text-neutral-400 group-hover:text-[#D4A843] transition-colors duration-200">
                        {getInitials(employee.name)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] text-white font-light truncate group-hover:text-[#D4A843] transition-colors duration-200">
                      {employee.name}
                    </h3>
                    <p className="text-[12px] text-neutral-500 font-light truncate">
                      {employee.job_title || '—'}
                    </p>
                  </div>
                </div>

                {/* Department Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-[0.1em] ${deptColor}`}
                  >
                    {employee.department || 'Unassigned'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 pt-2 border-t border-[#1F1F1F]/50">
                  {employee.email && (
                    <span className="flex items-center gap-2 text-[11px] text-neutral-500 font-light truncate">
                      <Mail size={11} className="text-neutral-600 shrink-0" />
                      {employee.email}
                    </span>
                  )}
                  {employee.phone && (
                    <span className="flex items-center gap-2 text-[11px] text-neutral-500 font-light truncate">
                      <Phone size={11} className="text-neutral-600 shrink-0" />
                      {employee.phone}
                    </span>
                  )}
                  {!employee.email && !employee.phone && (
                    <span className="text-[11px] text-neutral-600 font-light">
                      No contact info
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && resolvedEmployees.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <span className="text-[12px] text-neutral-500 font-light">
            Page {page} of {resolvedTotalPages} &middot; {resolvedTotal} employees
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


