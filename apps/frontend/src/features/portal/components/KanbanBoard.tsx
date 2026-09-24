'use client';

/**
 * HEXA Portal v3.0 — Kanban Board
 *
 * Four-column Kanban: Todo, In Progress, Review, Done.
 * Fetches tasks from GET /api/portal/projects/:projectId/tasks.
 * Luxury dark UI with amber accent, priority indicators, and due-date badges.
 *
 * Cinematic framer-motion choreography:
 *  - Staggered entrance for task cards within each column
 *  - Hover-lift micro-interaction on task cards
 *  - Premium loading skeleton with a sweeping gold shimmer
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/config/constants';
import { Icon, type IconName } from './PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeLift, staggerContainer, makeTransition, STAGGER, REDUCED_TRANSITION } from '@/lib/motion';
import type { PortalTask, TaskStatus, TaskPriority } from '../types';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  projectId: number;
}

const COLUMNS: { status: TaskStatus; label: string; icon: IconName; color: string }[] = [
  { status: 'todo', label: 'To Do', icon: 'box', color: 'text-sl-mist/60' },
  { status: 'in_progress', label: 'In Progress', icon: 'clock', color: 'text-sl-gold-hover' },
  { status: 'review', label: 'Review', icon: 'eye', color: 'text-sl-gold-bright' },
  { status: 'done', label: 'Done', icon: 'check-circle', color: 'text-success-ink' },
];

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  urgent: { bg: 'bg-destructive/20', text: 'text-destructive-ink', label: 'Urgent' },
  high: { bg: 'bg-sl-gold-deep/20', text: 'text-sl-gold-deep', label: 'High' },
  medium: { bg: 'bg-sl-gold-subtle/20', text: 'text-sl-gold-hover', label: 'Medium' },
  low: { bg: 'bg-neutral-700/50', text: 'text-sl-mist/60', label: 'Low' },
};

function ShimmerBlock({ reduced, className }: { reduced: boolean; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded bg-sl-obsidian', className)} aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.10) 50%, transparent 100%)' }}
        animate={reduced ? undefined : { x: ['-100%', '100%'] }}
        transition={reduced ? REDUCED_TRANSITION : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function KanbanSkeleton({ reduced }: { reduced: boolean }) {
  return (
    <div className="bg-sl-void border border-sl-obsidian rounded-2xl p-6 space-y-4">
      <ShimmerBlock reduced={reduced} className="h-4 w-28" />
      <div className="flex space-x-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="flex-1 space-y-3">
            <ShimmerBlock reduced={reduced} className="h-4 w-20" />
            <ShimmerBlock reduced={reduced} className="h-24 rounded-xl" />
            <ShimmerBlock reduced={reduced} className="h-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, reduced }: { task: PortalTask; reduced: boolean }) {
  const priority = PRIORITY_STYLES[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      variants={fadeLift}
      whileHover={reduced ? undefined : { y: -4, transition: makeTransition('interaction', 'micro') }}
      className="bg-neutral-950 border border-sl-obsidian rounded-xl p-4 space-y-2 hover:border-sl-gold/40 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
            priority.bg, priority.text
          )}
        >
          {priority.label}
        </span>
        {task.dueDate && (
          <span
            className={cn('text-[10px] font-mono', isOverdue ? 'text-destructive-ink font-bold' : 'text-sl-mist/60')}
          >
            {isOverdue
              ? 'Overdue'
              : new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
          </span>
        )}
      </div>

       <h4 className="text-sm font-semibold text-neutral-200 leading-snug group-hover:text-sl-gold transition-colors">
         {task.title}
       </h4>

      {task.description && (
        <p className="text-[11px] text-sl-mist/60 line-clamp-2 leading-relaxed">
          {task.description.replace(/<[^>]+>/g, '').trim()}
        </p>
      )}

      {task.assigneeName && (
        <div className="flex items-center space-x-2 pt-1">
           <div className="w-5 h-5 rounded-full bg-sl-gold/20 text-sl-gold flex items-center justify-center text-[8px] font-bold">
            {task.assigneeName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <span className="text-[10px] text-sl-mist/60">{task.assigneeName}</span>
        </div>
      )}
    </motion.div>
  );
}

function KanbanColumn({
  label,
  icon,
  color,
  tasks,
  reduced,
}: {
  label: string;
  icon: IconName;
  color: string;
  tasks: PortalTask[];
  reduced: boolean;
}) {
  return (
    <section
      className="flex flex-col space-y-3 min-w-[240px] flex-1"
      aria-label={`${label} column`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Icon name={icon} className={cn('w-4 h-4', color)} />
          <h3 className="text-xs font-bold text-sl-mist/80 uppercase tracking-wider">
            {label}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-sl-mist/60 bg-sl-obsidian px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <motion.div
        variants={staggerContainer(STAGGER.component)}
        custom={reduced}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} reduced={reduced} />
        ))}
        {tasks.length === 0 && (
          <motion.div
            variants={fadeLift}
            custom={reduced}
            className="border border-dashed border-sl-obsidian rounded-xl p-8 text-center"
          >
            <p className="text-[11px] text-sl-mist/60">No tasks</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

async function fetchProjectTasks(projectId: number): Promise<PortalTask[]> {
  const res = await fetch(`${API_BASE_URL}/api/portal/projects/${projectId}/tasks`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  return res.json();
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const reduced = useReducedMotion();
  const { data: tasks = [], isLoading } = useQuery<PortalTask[]>({
    queryKey: ['portal-tasks', projectId],
    queryFn: () => fetchProjectTasks(projectId),
  });

  if (isLoading) {
    return <KanbanSkeleton reduced={reduced} />;
  }

  return (
    <motion.div
      variants={fadeLift}
      custom={reduced}
      initial="hidden"
      animate="visible"
      className="bg-sl-void border border-sl-obsidian rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-100">Project Tasks</h3>
         <span className="text-[10px] text-sl-mist/60 font-mono tracking-[0.3em]">{tasks.length} total</span>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);
          return (
            <KanbanColumn
              key={col.status}
              label={col.label}
              icon={col.icon}
              color={col.color}
              tasks={columnTasks}
              reduced={reduced}
            />
          );
        })}
      </div>
    </motion.div>
  );
}