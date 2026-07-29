'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface KanbanTask {
  id: string;
  title: string;
  status: KanbanColumnId;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  assignee?: { fullName: string };
  labels?: string[];
}

export type KanbanColumnId = string;

export interface KanbanColumn {
  id: KanbanColumnId;
  label: string;
  color: string;
  icon: typeof AlertCircle;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  onTaskMove: (taskId: string, newStatus: KanbanColumnId) => void;
  onTaskClick?: (task: KanbanTask) => void;
  isLoading?: boolean;
}

// ─── Priority Config ────────────────────────────────────────────────────────

const PRIORITY: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Urgent' },
  high: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'High' },
  normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Normal' },
  low: { bg: 'bg-neutral-800', text: 'text-neutral-500', label: 'Low' },
};

// ─── Task Card ──────────────────────────────────────────────────────────────

function TaskCard({ task, onDragStart, onClick }: { task: KanbanTask; onDragStart: (e: React.DragEvent, task: KanbanTask) => void; onClick?: (task: KanbanTask) => void }) {
  const priority = task.priority ? PRIORITY[task.priority] : null;

  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, task)}
      onClick={() => onClick?.(task)}
      className="cursor-grab active:cursor-grabbing"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-4 hover:border-[#D4A843]/20 transition-colors group"
      >
        <div className="flex items-start gap-2.5">
          <GripVertical size={13} className="text-[#333] group-hover:text-[#555] mt-0.5 shrink-0 transition-colors" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-light leading-snug mb-2 group-hover:text-[#D4A843] transition-colors">
              {task.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {priority && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
                  {priority.label}
                </span>
              )}
              {task.assignee && (
                <span className="flex items-center gap-1 text-[10px] text-[#555]">
                  <User size={10} />
                  {task.assignee.fullName}
                </span>
              )}
            </div>
            {task.labels && task.labels.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {task.labels.map((l) => (
                  <span key={l} className="w-2 h-2 rounded-full bg-[#D4A843]/40" />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Column ─────────────────────────────────────────────────────────────────

function KanbanColumnComponent({
  column,
  tasks,
  onTaskMove,
  onTaskClick,
  onDragStart,
  onDrop,
}: {
  column: KanbanColumn;
  tasks: KanbanTask[];
  onTaskMove: (taskId: string, newStatus: KanbanColumnId) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onDragStart: (e: React.DragEvent, task: KanbanTask) => void;
  onDrop: (e: React.DragEvent, columnId: KanbanColumnId) => void;
}) {
  const Icon = column.icon;
  const count = tasks.length;
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className="flex flex-col bg-[#0E0E0E] border border-[#1F1F1F] rounded-2xl min-h-[400px] w-72 shrink-0"
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { setIsOver(false); onDrop(e, column.id); }}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F] ${isOver ? 'bg-[#D4A843]/5' : ''} transition-colors rounded-t-2xl`}>
        <div className="flex items-center gap-2.5">
          <Icon size={15} className={column.color} />
          <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-white">{column.label}</h3>
        </div>
        <span className="text-[10px] text-[#555] bg-[#1A1A1A] px-2 py-0.5 rounded-full tabular-nums">{count}</span>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDragStart={onDragStart} onClick={onTaskClick} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-[11px] text-[#444] font-light">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Default Columns ────────────────────────────────────────────────────────

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'TODO', label: 'To Do', color: 'text-neutral-400', icon: AlertCircle },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-400', icon: Clock },
  { id: 'REVIEW', label: 'Review', color: 'text-[#D4A843]', icon: AlertCircle },
  { id: 'DONE', label: 'Done', color: 'text-emerald-400', icon: CheckCircle2 },
];

// ─── KanbanBoard ────────────────────────────────────────────────────────────

export function KanbanBoard({ columns = DEFAULT_COLUMNS, tasks, onTaskMove, onTaskClick, isLoading }: KanbanBoardProps) {
  const handleDragStart = useCallback((e: React.DragEvent, task: KanbanTask) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: KanbanColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskMove(taskId, columnId);
    }
  }, [onTaskMove]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-72 h-96 bg-[#0E0E0E] border border-[#1F1F1F] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-4 pb-6">
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          tasks={tasks.filter((t) => t.status === column.id)}
          onTaskMove={onTaskMove}
          onTaskClick={onTaskClick}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}