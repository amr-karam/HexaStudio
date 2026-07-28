'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/lib/hooks';
import {
  CheckSquare,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  urgent: 'text-red-400 bg-red-500/10',
  high: 'text-amber-400 bg-amber-500/10',
  normal: 'text-blue-400 bg-blue-500/10',
  low: 'text-neutral-500 bg-neutral-800',
};

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const { data: tasks, isLoading, total } = useTasks(
    search ? { search, limit: 50 } : { limit: 50 },
  );

  return (
    <div className="p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          <span className="text-gold">Tasks</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Track and manage project tasks across your workspace.
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
        />
      </div>

      {/* Task List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <p className="text-sm text-neutral-400 font-light">
            {total > 0 ? `${total} task${total === 1 ? '' : 's'}` : 'Tasks'}
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-neutral-800 rounded-lg" />
              ))}
            </div>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="divide-y divide-border/30">
            {tasks.map((task, i) => (
              <motion.div
                key={task.id ?? i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="shrink-0">
                  {task.state === 'done' ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <CheckSquare size={18} className="text-neutral-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-light truncate">
                    {task.name || 'Unnamed Task'}
                  </p>
                  {task.date_deadline && (
                    <p className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(task.date_deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {task.priority && (
                  <span
                    className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md ${
                      priorityColors[task.priority] || 'text-neutral-500 bg-neutral-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
                <ChevronRight size={14} className="text-neutral-700 shrink-0" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle size={32} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-600 text-sm font-light">No tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}