'use client';

/**
 * HEXA Portal v3.0 — Kanban Board
 *
 * Four-column Kanban: Todo, In Progress, Review, Done.
 * Fetches tasks from GET /api/portal/projects/:projectId/tasks.
 * Luxury dark UI with amber accent, priority indicators, and due-date badges.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/constants';
import { Icon, type IconName } from './PortalIcons';
import type { PortalTask, TaskStatus, TaskPriority } from '../types';

interface KanbanBoardProps {
  projectId: number;
}

const COLUMNS: { status: TaskStatus; label: string; icon: IconName; color: string }[] = [
  { status: 'todo', label: 'To Do', icon: 'box', color: 'text-neutral-400' },
  { status: 'in_progress', label: 'In Progress', icon: 'clock', color: 'text-blue-400' },
  { status: 'review', label: 'Review', icon: 'eye', color: 'text-amber-400' },
  { status: 'done', label: 'Done', icon: 'check-circle', color: 'text-emerald-400' },
];

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Urgent' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'High' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Medium' },
  low: { bg: 'bg-neutral-700/50', text: 'text-neutral-400', label: 'Low' },
};

function TaskCard({ task }: { task: PortalTask }) {
  const priority = PRIORITY_STYLES[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2 hover:border-neutral-700 transition-colors group">
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.bg} ${priority.text} uppercase tracking-wider`}
        >
          {priority.label}
        </span>
        {task.dueDate && (
          <span
            className={`text-[10px] font-mono ${isOverdue ? 'text-red-400 font-bold' : 'text-neutral-500'}`}
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

      <h4 className="text-sm font-semibold text-neutral-200 leading-snug group-hover:text-amber-400 transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
          {task.description.replace(/<[^>]+>/g, '').trim()}
        </p>
      )}

      {task.assigneeName && (
        <div className="flex items-center space-x-2 pt-1">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[8px] font-bold">
            {task.assigneeName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <span className="text-[10px] text-neutral-500">{task.assigneeName}</span>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  label,
  icon,
  color,
  tasks,
}: {
  label: string;
  icon: IconName;
  color: string;
  tasks: PortalTask[];
}) {
  return (
    <div className="flex flex-col space-y-3 min-w-[240px] flex-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Icon name={icon} className={`w-4 h-4 ${color}`} />
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {label}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="border border-dashed border-neutral-800 rounded-xl p-8 text-center">
            <p className="text-[11px] text-neutral-600">No tasks</p>
          </div>
        )}
      </div>
    </div>
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
  const { data: tasks = [], isLoading } = useQuery<PortalTask[]>({
    queryKey: ['portal-tasks', projectId],
    queryFn: () => fetchProjectTasks(projectId),
  });

  if (isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="h-4 w-28 bg-neutral-800 rounded animate-pulse" />
        <div className="flex space-x-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="flex-1 space-y-3">
              <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse" />
              <div className="h-24 bg-neutral-900 rounded-xl animate-pulse" />
              <div className="h-24 bg-neutral-900 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-100">Project Tasks</h3>
        <span className="text-[10px] text-neutral-500 font-mono">{tasks.length} total</span>
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
            />
          );
        })}
      </div>
    </div>
  );
}
