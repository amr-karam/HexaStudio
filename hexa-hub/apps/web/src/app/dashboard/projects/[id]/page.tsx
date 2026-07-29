'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { KanbanBoard, DEFAULT_COLUMNS, type KanbanTask, type KanbanColumnId } from '@/components/KanbanBoard';
import ProjectTimeline, { MOCK_TIMELINE_TASKS } from '@/components/ProjectTimeline';
import { SkeletonCard, SkeletonText, SkeletonPageHeader } from '@/components/Skeleton';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ApiTask { id: string; title: string; status: string; priority?: string; assignee?: { fullName: string } }
interface Workspace { id: string; name: string; description: string; status?: string; client?: { fullName: string }; date_start?: string }

type TabId = 'overview' | 'kanban' | 'timeline';

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('kanban');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const api = useCallback(() => axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } }), [token, API_URL]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const a = api();
        const [wsRes, taskRes] = await Promise.all([a.get(`/workspaces/${params.id}`), a.get(`/workspaces/${params.id}/tasks`)]);
        setWorkspace(wsRes.data);
        setTasks(taskRes.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [token, params.id, api]);

  const handleTaskMove = async (taskId: string, newStatus: KanbanColumnId) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api().put(`/workspaces/${params.id}/tasks/${taskId}`, { status: newStatus });
    } catch { /* revert handled by refetch */ }
  };

  const kanbanTasks: KanbanTask[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as KanbanColumnId,
    priority: (t.priority as KanbanTask['priority']) || 'normal',
    assignee: t.assignee,
  }));

  const TABS: { id: TabId; label: string; icon: typeof FolderKanban }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: FolderKanban },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 md:p-10">
        {/* Header skeleton */}
        <div className="pb-0 mb-8">
          <SkeletonPageHeader />
        </div>

        {/* Meta badges skeleton */}
        <div className="flex items-center gap-6 mb-8">
          <SkeletonText width="120px" />
          <SkeletonText width="140px" />
          <SkeletonText width="80px" />
        </div>

        {/* Tab bar skeleton */}
        <div className="flex gap-1 border-b border-[#1F1F1F] mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-3">
              <SkeletonText width="80px" className="h-4" />
            </div>
          ))}
        </div>

        {/* Content skeleton — stat cards + kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={1} />
          ))}
        </div>

        {/* Kanban columns skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4 space-y-3">
              <SkeletonText width="60%" className="h-5" />
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonCard key={j} lines={2} className="p-4" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-8 md:p-10 pb-0">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#666] mb-3">
          <LayoutDashboard size={13} />
          <span>Workspace / {workspace?.name}</span>
          {workspace?.status && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${workspace.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
              {workspace.status}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-serif font-light text-white mb-2">{workspace?.name}</h1>
        <p className="text-neutral-500 font-light text-base max-w-3xl mb-6">{workspace?.description}</p>

        {/* Meta badges */}
        <div className="flex items-center gap-6 mb-8">
          {workspace?.client && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#888]"><Users size={13} />{workspace.client.fullName}</span>
          )}
          {workspace?.date_start && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#888]"><Calendar size={13} />{new Date(workspace.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          )}
          <span className="flex items-center gap-1.5 text-[12px] text-[#888]"><CheckCircle2 size={13} />{tasks.length} tasks</span>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-[#1F1F1F]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-light transition-all border-b-2 -mb-px ${
                  active ? 'border-[#D4A843] text-[#D4A843]' : 'border-transparent text-[#555] hover:text-[#888]'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="p-4 md:p-6">
        {activeTab === 'overview' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest text-[#555] mb-3 block">Total Tasks</span>
              <span className="text-3xl font-serif font-light text-white">{tasks.length}</span>
            </div>
            <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest text-[#555] mb-3 block">In Progress</span>
              <span className="text-3xl font-serif font-light text-blue-400">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
            </div>
            <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest text-[#555] mb-3 block">Completed</span>
              <span className="text-3xl font-serif font-light text-emerald-400">{tasks.filter(t => t.status === 'DONE').length}</span>
            </div>
          </motion.div>
        ) : activeTab === 'kanban' ? (
          <KanbanBoard columns={DEFAULT_COLUMNS} tasks={kanbanTasks} onTaskMove={handleTaskMove} />
        ) : (
          <ProjectTimeline tasks={MOCK_TIMELINE_TASKS} projectStart="2026-06-01" projectEnd="2026-09-15" />
        )}
      </div>
    </div>
  );
}