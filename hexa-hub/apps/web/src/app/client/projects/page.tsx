'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Loader2,
  Search,
  Filter,
  Archive,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
  completed_date?: string;
  x_hexa_client_viewable: boolean;
  x_hexa_description?: string;
  x_hexa_order: number;
}

interface ClientWorkspace {
  id: string;
  name: string;
  description?: string;
  status: string;
  type?: string;
  client_portal_active: boolean;
  milestones?: Milestone[];
  total_tasks?: number;
  completed_tasks?: number;
  budget_amount?: number;
  created_at: string;
}

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  inquiry: {
    label: 'Inquiry',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: Search,
  },
  consultation: {
    label: 'Consultation',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    icon: Clock,
  },
  proposal: {
    label: 'Proposal',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: AlertCircle,
  },
  active: {
    label: 'Active',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: Briefcase,
  },
  on_hold: {
    label: 'On Hold',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    icon: Pause,
  },
  completed: {
    label: 'Completed',
    color: 'text-gold',
    bg: 'bg-gold/10 border-gold/20',
    icon: CheckCircle,
  },
  archived: {
    label: 'Archived',
    color: 'text-neutral-500',
    bg: 'bg-neutral-500/10 border-neutral-500/20',
    icon: Archive,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateProgress(project: ClientWorkspace): number {
  if (!project.milestones || project.milestones.length === 0) {
    if (project.total_tasks && project.completed_tasks) {
      return Math.round((project.completed_tasks / project.total_tasks) * 100);
    }
    return 0;
  }
  const viewable = project.milestones.filter((m) => m.x_hexa_client_viewable);
  if (viewable.length === 0) return 0;
  const completed = viewable.filter((m) => m.completed).length;
  return Math.round((completed / viewable.length) * 100);
}

function getNextMilestone(project: ClientWorkspace): Milestone | null {
  if (!project.milestones) return null;
  const viewable = project.milestones
    .filter((m) => m.x_hexa_client_viewable && !m.completed)
    .sort((a, b) => a.x_hexa_order - b.x_hexa_order);
  return viewable[0] ?? null;
}

// ─── Project Card ───────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
}: {
  project: ClientWorkspace;
  index: number;
}) {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.inquiry;
  const StatusIcon = status.icon;
  const progress = calculateProgress(project);
  const nextMilestone = getNextMilestone(project);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/client/projects/${project.id}`}>
        <div className="group p-6 bg-surface border border-border rounded-2xl hover:border-gold/20 transition-all duration-500 cursor-pointer relative overflow-hidden">
          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-b from-gold/[0.02] to-transparent" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-base font-medium text-white group-hover:text-gold transition-colors duration-300 truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 font-light">
                    {project.description}
                  </p>
                )}
              </div>

              <span
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-widest font-medium ${status.bg} ${status.color}`}
              >
                <StatusIcon size={10} />
                {status.label}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-neutral-600">
                  Progress
                </span>
                <span className="text-xs text-neutral-500 font-light">{progress}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.3 + index * 0.06, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
                />
              </div>
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-xl border border-border/30 mb-4">
                <Clock size={12} className="text-gold/70 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600">
                    Next Milestone
                  </p>
                  <p className="text-xs text-neutral-400 truncate font-light mt-0.5">
                    {nextMilestone.name}
                  </p>
                </div>
                {nextMilestone.date && (
                  <span className="text-[10px] text-neutral-600 flex-shrink-0">
                    {new Date(nextMilestone.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-700">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-neutral-600 group-hover:text-gold transition-colors duration-300">
                View Details
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <div className="p-6 bg-surface border border-border rounded-2xl animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-800 rounded w-2/3" />
          <div className="h-3 bg-neutral-800 rounded w-full" />
        </div>
        <div className="h-6 w-20 bg-neutral-800 rounded-lg" />
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full mb-4" />
      <div className="h-14 bg-neutral-800/50 rounded-xl mb-4" />
      <div className="h-3 bg-neutral-800 rounded w-1/4" />
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function ClientProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<ClientWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!token) return;

    const fetchProjects = async () => {
      try {
        const res = await axios.get<ClientWorkspace[]>(`${API_URL}/client/workspaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch {
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [token, API_URL]);

  // Filter and search
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = projects.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-serif font-light text-white mb-2">
          My <span className="text-gold">Projects</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Track your project milestones, timelines, and deliverables.
        </p>
      </motion.div>

      {/* Filters */}
      {!isLoading && projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold/30 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-neutral-600" />
            {['all', ...Object.keys(statusCounts)].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium transition-all duration-300 ${
                  filterStatus === status
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-neutral-500 border border-border hover:border-neutral-600'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_CONFIG[status]?.label || status}
                {statusCounts[status] && (
                  <span className="ml-1 opacity-50">{statusCounts[status]}</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 bg-surface border border-red-500/20 rounded-2xl text-center"
        >
          <AlertCircle size={32} className="mx-auto text-red-400/50 mb-3" />
          <p className="text-neutral-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-12 bg-surface border border-border rounded-3xl text-center"
        >
          <Briefcase size={40} className="mx-auto text-neutral-700 mb-4" />
          <p className="text-neutral-500 font-light text-lg">
            {projects.length === 0
              ? 'No active projects yet.'
              : 'No projects match your filters.'}
          </p>
          <p className="text-neutral-600 text-sm mt-2">
            {projects.length === 0
              ? 'Your assigned projects will appear here.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </motion.div>
      )}

      {/* Project Grid */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
