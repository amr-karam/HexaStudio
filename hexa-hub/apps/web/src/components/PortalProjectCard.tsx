'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'review' | 'completed';
  progress: number;
  deadline: string;
  nextMilestone: string;
  milestoneDate: string;
  budget: number;
  spent: number;
}

const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; bg: string }> = {
  planning: { label: 'Planning', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  review: { label: 'Review', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  completed: { label: 'Completed', color: 'text-violet-400', bg: 'bg-violet-500/10' },
};

export default function PortalProjectCard({ project }: { project: Project }) {
  const status = STATUS_CONFIG[project.status];
  const budgetPercent = Math.min(Math.round((project.spent / project.budget) * 100), 100);
  const isOverBudget = budgetPercent > 100;
  const isOverdue = new Date(project.deadline) < new Date();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 hover:border-[#D4A843]/20 transition-all cursor-pointer h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white truncate flex-1 mr-2">{project.name}</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#555]">Progress</span>
          <span className="text-[10px] font-mono text-[#555]">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full ${project.progress >= 100 ? 'bg-emerald-500' : 'bg-[#D4A843]'}`}
          />
        </div>
      </div>

      {/* Milestone */}
      <div className="flex items-center gap-2 text-[11px] text-[#555] mb-2">
        <Clock size={12} />
        <span>Next: {project.nextMilestone}</span>
        <span className="text-[#444]">·</span>
        <span className={isOverdue ? 'text-red-400' : ''}>{project.milestoneDate}</span>
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          {isOverBudget ? (
            <AlertCircle size={12} className="text-red-400" />
          ) : (
            <CheckCircle2 size={12} className="text-emerald-400" />
          )}
          <span className="text-[#555]">
            ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
          </span>
        </div>
        {isOverdue && <span className="text-red-400 font-medium">Overdue</span>}
      </div>
    </motion.div>
  );
}
