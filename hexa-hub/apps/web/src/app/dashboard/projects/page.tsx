'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Search,
  FolderKanban,
  LayoutGrid,
  LayoutList,
  Filter,
  ChevronRight,
  Calendar,
  Clock,
  Briefcase,
} from 'lucide-react';
import { OdooProject, ProjectType, ProjectStatus } from '@hexa-hub/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProjectFilters {
  search: string;
  type: ProjectType | '';
  status: ProjectStatus | '';
}

interface PaginatedResponse {
  content: OdooProject[];
  total: number;
  page: number;
  pageSize: number;
}

type ViewMode = 'grid' | 'list';

// ─── Constants ──────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  [ProjectType.RESIDENTIAL]: {
    label: 'Residential',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
  },
  [ProjectType.COMMERCIAL]: {
    label: 'Commercial',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
  },
  [ProjectType.INTERIOR]: {
    label: 'Interior',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
  [ProjectType.LANDSCAPE]: {
    label: 'Landscape',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  [ProjectStatus.INQUIRY]: {
    label: 'Inquiry',
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    dot: 'bg-neutral-400',
  },
  [ProjectStatus.CONSULTATION]: {
    label: 'Consultation',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  [ProjectStatus.PROPOSAL]: {
    label: 'Proposal',
    bg: 'bg-[#D4A843]/10',
    text: 'text-[#D4A843]',
    dot: 'bg-[#D4A843]',
  },
  [ProjectStatus.ACTIVE]: {
    label: 'Active',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  [ProjectStatus.ON_HOLD]: {
    label: 'On Hold',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Completed',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    dot: 'bg-green-400',
  },
  [ProjectStatus.ARCHIVED]: {
    label: 'Archived',
    bg: 'bg-neutral-500/5',
    text: 'text-neutral-600',
    dot: 'bg-neutral-600',
  },
};

const TYPE_OPTIONS: { value: ProjectType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: ProjectType.RESIDENTIAL, label: 'Residential' },
  { value: ProjectType.COMMERCIAL, label: 'Commercial' },
  { value: ProjectType.INTERIOR, label: 'Interior' },
  { value: ProjectType.LANDSCAPE, label: 'Landscape' },
];

const STATUS_OPTIONS: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: ProjectStatus.INQUIRY, label: 'Inquiry' },
  { value: ProjectStatus.CONSULTATION, label: 'Consultation' },
  { value: ProjectStatus.PROPOSAL, label: 'Proposal' },
  { value: ProjectStatus.ACTIVE, label: 'Active' },
  { value: ProjectStatus.ON_HOLD, label: 'On Hold' },
  { value: ProjectStatus.COMPLETED, label: 'Completed' },
  { value: ProjectStatus.ARCHIVED, label: 'Archived' },
];

const PAGE_SIZE = 12;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function computeProgress(project: OdooProject): number {
  if (!project.planned_hours || project.planned_hours === 0) return 0;
  return Math.min(
    100,
    Math.round(((project.total_hours ?? 0) / project.planned_hours) * 100),
  );
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

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const listRowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    type: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchProjects = useCallback(async (): Promise<PaginatedResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: PAGE_SIZE.toString(),
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);

    const res = await axios.get<PaginatedResponse>(
      `${API_URL}/odoo/projects?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }, [page, debouncedSearch, filters.type, filters.status, token]);

  const { data, isLoading, isError } = useQuery<PaginatedResponse>({
    queryKey: [
      'projects',
      debouncedSearch,
      filters.type,
      filters.status,
      page,
    ],
    queryFn: fetchProjects,
    staleTime: 60_000,
    enabled: !!token,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const projects = data?.content ?? [];

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
          <FolderKanban size={13} />
          <span>Projects</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Projects
            </h1>
            <p className="text-[13px] text-[#666] font-light">
              {data?.total ?? 0} total projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-[#141414] border border-[#1F1F1F] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-[#1F1F1F] text-[#D4A843]'
                    : 'text-[#555] hover:text-[#888]'
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-[#1F1F1F] text-[#D4A843]'
                    : 'text-[#555] hover:text-[#888]'
                }`}
              >
                <LayoutList size={15} />
              </button>
            </div>
          </div>
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
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-[#555] font-light focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20 transition-all duration-300"
          />
        </div>
        <div className="relative">
          <Filter
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none"
          />
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                type: e.target.value as ProjectType | '',
              }));
              setPage(1);
            }}
            className="appearance-none pl-9 pr-8 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
        </div>
        <div className="relative">
          <Briefcase
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none"
          />
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as ProjectStatus | '',
              }));
              setPage(1);
            }}
            className="appearance-none pl-9 pr-8 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-neutral-300 font-light focus:outline-none focus:border-[#D4A843]/40 transition-all duration-300 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
          <span className="text-[12px] text-[#555] font-light tracking-wide">
            Loading projects...
          </span>
        </div>
      ) : isError ? (
        <div className="p-16 text-center">
          <p className="text-red-400 text-sm">Failed to load projects.</p>
          <p className="text-[#555] text-xs mt-1">
            Please check your connection and try again.
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center">
          <FolderKanban size={32} className="text-[#333] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No projects found.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ─── Grid View ─────────────────────────────────────────────── */
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {projects.map((project) => {
            const typeCfg = project.x_hexa_type
              ? TYPE_CONFIG[project.x_hexa_type] ?? null
              : null;
            const statusCfg = project.x_hexa_status
              ? STATUS_CONFIG[project.x_hexa_status] ?? null
              : null;
            const progress = computeProgress(project);

            return (
              <motion.div
                key={project.id}
                variants={cardVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() =>
                  router.push(`/dashboard/projects/${project.id}`)
                }
                className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer group hover:border-[#D4A843]/20 transition-all duration-300"
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {typeCfg && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-[0.1em] ${typeCfg.bg} ${typeCfg.text}`}
                    >
                      {typeCfg.label}
                    </span>
                  )}
                  {statusCfg && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${statusCfg.dot}`}
                      />
                      {statusCfg.label}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-[15px] text-white font-light mb-1 group-hover:text-[#D4A843] transition-colors duration-200 truncate">
                  {project.name}
                </h3>

                {/* Client */}
                <p className="text-[12px] text-[#666] font-light mb-4 truncate">
                  {project.partner_id?.[1] ?? 'No client'}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-[#555] font-light uppercase tracking-wider">
                      Progress
                    </span>
                    <span className="text-[11px] text-[#888] tabular-nums">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`h-full rounded-full ${
                        progress >= 100
                          ? 'bg-emerald-500'
                          : progress > 50
                            ? 'bg-[#D4A843]'
                            : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1F1F1F]/50">
                  {project.date_start ? (
                    <span className="flex items-center gap-1 text-[10px] text-[#555]">
                      <Calendar size={10} />
                      {formatDate(project.date_start)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <ChevronRight
                    size={14}
                    className="text-[#333] group-hover:text-[#D4A843] transition-colors duration-200"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* ─── List View ─────────────────────────────────────────────── */
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
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Project
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Client
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Progress
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-[#555]">
                    Start Date
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {projects.map((project) => {
                  const typeCfg = project.x_hexa_type
                    ? TYPE_CONFIG[project.x_hexa_type] ?? null
                    : null;
                  const statusCfg = project.x_hexa_status
                    ? STATUS_CONFIG[project.x_hexa_status] ?? null
                    : null;
                  const progress = computeProgress(project);

                  return (
                    <motion.tr
                      key={project.id}
                      variants={listRowVariants}
                      onClick={() =>
                        router.push(`/dashboard/projects/${project.id}`)
                      }
                      className="border-b border-[#1F1F1F]/50 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-light group-hover:text-[#D4A843] transition-colors duration-200">
                          {project.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {typeCfg ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-[0.1em] ${typeCfg.bg} ${typeCfg.text}`}
                          >
                            {typeCfg.label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#444]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {statusCfg ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${statusCfg.dot}`}
                            />
                            {statusCfg.label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#444]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#999] font-light">
                          {project.partner_id?.[1] ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 max-w-[80px] h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                progress >= 100
                                  ? 'bg-emerald-500'
                                  : progress > 50
                                    ? 'bg-[#D4A843]'
                                    : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#666] tabular-nums">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[12px] text-[#555] font-light">
                          <Calendar size={11} className="text-[#444]" />
                          {project.date_start
                            ? formatDate(project.date_start)
                            : '—'}
                        </span>
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
      {!isLoading && !isError && projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <span className="text-[12px] text-[#555] font-light">
            Page {page} of {totalPages} &middot; {data?.total ?? 0} projects
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-[#888] bg-[#1A1A1A] border border-[#1F1F1F] rounded-md hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={13} className="rotate-180" />
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
        </motion.div>
      )}
    </div>
  );
}

// ─── Inline Helper ──────────────────────────────────────────────────────────

function ChevronDownIcon({ className }: { className?: string }) {
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
