'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Loader2,
  Calendar,
  ArrowRight,
  Folder,
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

interface Document {
  id: string;
  name: string;
  mimetype: string;
  filesize: number;
  create_date: string;
}

interface ClientWorkspaceDetail {
  id: string;
  name: string;
  description?: string;
  status: string;
  type?: string;
  client_portal_active: boolean;
  milestones?: Milestone[];
  documents?: Document[];
  total_tasks?: number;
  completed_tasks?: number;
  budget_amount?: number;
  created_at: string;
  updated_at?: string;
}

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  inquiry: { label: 'Inquiry', color: 'text-blue-400', dot: 'bg-blue-400' },
  consultation: { label: 'Consultation', color: 'text-violet-400', dot: 'bg-violet-400' },
  proposal: { label: 'Proposal', color: 'text-amber-400', dot: 'bg-amber-400' },
  active: { label: 'Active', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  on_hold: { label: 'On Hold', color: 'text-orange-400', dot: 'bg-orange-400' },
  completed: { label: 'Completed', color: 'text-gold', dot: 'bg-gold' },
  archived: { label: 'Archived', color: 'text-neutral-500', dot: 'bg-neutral-500' },
};

// ─── Milestone Timeline ─────────────────────────────────────────────────────

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const viewable = milestones
    .filter((m) => m.x_hexa_client_viewable)
    .sort((a, b) => a.x_hexa_order - b.x_hexa_order);

  if (viewable.length === 0) {
    return (
      <div className="p-6 bg-surface border border-border rounded-2xl text-center">
        <Clock size={32} className="mx-auto text-neutral-700 mb-3" />
        <p className="text-neutral-500 text-sm font-light">
          No client-visible milestones yet.
        </p>
      </div>
    );
  }

  // Find the next uncompleted milestone
  const nextMilestoneId = viewable.find((m) => !m.completed)?.id;

  return (
    <div className="relative">
      {viewable.map((milestone, i) => {
        const isNext = milestone.id === nextMilestoneId;
        const isLast = i === viewable.length - 1;

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
            className="relative flex gap-4 pb-8"
          >
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  milestone.completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isNext
                    ? 'bg-gold/20 text-gold ring-2 ring-gold/30 ring-offset-2 ring-offset-background'
                    : 'bg-neutral-800 text-neutral-600'
                }`}
              >
                {milestone.completed ? (
                  <CheckCircle size={14} />
                ) : isNext ? (
                  <ArrowRight size={14} />
                ) : (
                  <Clock size={14} />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-px flex-1 mt-2 ${
                    milestone.completed ? 'bg-emerald-500/30' : 'bg-neutral-800'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 -mt-1 pb-2 ${
                isNext
                  ? 'p-4 bg-gold/[0.03] border border-gold/10 rounded-xl'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium ${
                      milestone.completed
                        ? 'text-neutral-400 line-through'
                        : isNext
                        ? 'text-white'
                        : 'text-neutral-500'
                    }`}
                  >
                    {milestone.name}
                    {isNext && (
                      <span className="ml-2 text-[9px] uppercase tracking-widest text-gold font-medium bg-gold/10 px-2 py-0.5 rounded-md">
                        Next
                      </span>
                    )}
                  </h4>
                  {milestone.x_hexa_description && (
                    <p className="text-xs text-neutral-600 mt-1 font-light">
                      {milestone.x_hexa_description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {milestone.completed && milestone.completed_date ? (
                    <span className="text-[10px] text-emerald-400/70">
                      Completed{' '}
                      {new Date(milestone.completed_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  ) : milestone.date ? (
                    <span className="text-[10px] text-neutral-600">
                      {new Date(milestone.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Documents Section ──────────────────────────────────────────────────────

function DocumentsSection({ documents }: { documents?: Document[] }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="p-8 bg-surface border border-border rounded-2xl text-center">
        <Folder size={32} className="mx-auto text-neutral-700 mb-3" />
        <p className="text-neutral-500 text-sm font-light">No documents uploaded yet.</p>
        <p className="text-neutral-700 text-xs mt-1">
          Project deliverables and files will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.05 }}
          className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-gold/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-500">
            <FileText size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-light truncate">{doc.name}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5">
              {formatFileSize(doc.filesize)} &middot;{' '}
              {new Date(doc.create_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <button className="p-2 text-neutral-600 hover:text-gold opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-gold/5">
            <Download size={16} />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function ClientProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<ClientWorkspaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!token) return;

    const fetchProject = async () => {
      try {
        const res = await axios.get<ClientWorkspaceDetail>(
          `${API_URL}/client/workspaces/${params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkspace(res.data);
      } catch {
        setError('Failed to load project details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [token, params.id, API_URL]);

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-4 bg-neutral-800 rounded w-32" />
          <div className="h-8 bg-neutral-800 rounded w-64 mb-2" />
          <div className="h-4 bg-neutral-800 rounded w-96" />
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-800/30 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-neutral-800/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error
  if (error || !workspace) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <Link
          href="/client/projects"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          Back to Projects
        </Link>
        <div className="p-12 bg-surface border border-red-500/20 rounded-2xl text-center">
          <AlertCircle size={32} className="mx-auto text-red-400/50 mb-3" />
          <p className="text-neutral-400 text-sm">{error || 'Project not found.'}</p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[workspace.status] || STATUS_CONFIG.inquiry;
  const viewableMilestones = (workspace.milestones || []).filter(
    (m) => m.x_hexa_client_viewable
  );
  const completedMilestones = viewableMilestones.filter((m) => m.completed).length;
  const progress =
    viewableMilestones.length > 0
      ? Math.round((completedMilestones / viewableMilestones.length) * 100)
      : 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/client/projects"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          Back to Projects
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-white mb-2">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-neutral-400 font-light max-w-2xl">
                {workspace.description}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] uppercase tracking-widest font-medium flex-shrink-0 ${status.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        <div className="p-5 bg-surface border border-border rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Progress</p>
          <p className="text-2xl font-serif text-white">{progress}%</p>
        </div>
        <div className="p-5 bg-surface border border-border rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Milestones</p>
          <p className="text-2xl font-serif text-white">
            {completedMilestones}
            <span className="text-sm text-neutral-600"> / {viewableMilestones.length}</span>
          </p>
        </div>
        <div className="p-5 bg-surface border border-border rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Type</p>
          <p className="text-sm text-neutral-300 font-light capitalize mt-1">
            {workspace.type?.replace(/_/g, ' ') || 'N/A'}
          </p>
        </div>
        <div className="p-5 bg-surface border border-border rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Started</p>
          <p className="text-sm text-neutral-300 font-light mt-1">
            {new Date(workspace.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-10 p-6 bg-surface border border-border rounded-2xl"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600">
            Overall Completion
          </p>
          <p className="text-xs text-gold font-medium">{progress}%</p>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-gold/60 via-gold to-gold"
          />
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Milestone Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="lg:col-span-3"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-gold" size={20} />
            <h2 className="text-lg font-serif font-light text-white">Project Milestones</h2>
          </div>
          <MilestoneTimeline milestones={workspace.milestones || []} />
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-gold" size={20} />
            <h2 className="text-lg font-serif font-light text-white">Documents</h2>
          </div>
          <DocumentsSection documents={workspace.documents} />
        </motion.div>
      </div>
    </div>
  );
}
