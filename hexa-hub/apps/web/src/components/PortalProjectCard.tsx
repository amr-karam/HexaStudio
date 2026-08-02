'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban, Calendar, CheckCircle2, TrendingUp, DollarSign,
  AlertTriangle, User, Clock, Target,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'review' | 'completed';
  progress: number;
  startDate: string;
  deadline: string;
  nextMilestone: string;
  milestoneDate: string;
  budget: number;
  spent: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PortalProjectCard({ project }: { project: Project }) {
  const statusConfig = {
    planning: { label: 'Planning', color: 'bg-blue-500/10 text-blue-400' },
    active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-400' },
    review: { label: 'In Review', color: 'bg-amber-500/10 text-amber-400' },
    completed: { label: 'Completed', color: 'bg-purple-500/10 text-purple-400' },
  };

  const config = statusConfig[project.status] || statusConfig.planning;
  const progressColor = project.progress > 90
    ? 'bg-red-500'
    : project.progress > 70
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4 hover:border-[#D4A843]/30 transition-all duration-300 group"
    >
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-hover:border-[#D4A843]/20" />
      
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
            style={{ backgroundColor: '#D4A843' }}>
            <FolderKanban size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 ml-3">
            <h2 className="text-lg font-serif font-light text-white">{project.name}</h2>
            <span className={config.color}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#666]">
            <div>
              <p className="font-medium">Start Date</p>
              <p>{new Date(project.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</p>
            </div>
            <div>
              <p className="font-medium">Deadline</p>
              <p>{new Date(project.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</p>
            </div>
            <div>
              <p className="font-medium">Budget</p>
              <p className="font-medium">$${project.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Spent</p>
              <p className="font-medium">$${project.spent.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#888]">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${progressColor}`} 
                style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* Next Milestone */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" 
              style={{ backgroundColor: '#D4A843/20' }}>
              <Target size={14} className="text-[#D4A843]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-light">{project.nextMilestone}</p>
              <p className="text-[10px] text-[#555]">{new Date(project.milestoneDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}</p>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-[#888]">Budget Utilization</span>
            <span className="font-medium">${((project.spent / project.budget) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${project.spent > project.budget * 0.9 ? 'bg-red-500' : project.spent > project.budget * 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-[#1F1F1F]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 bg-[#D4A843] text-[#0A0A0A] rounded-lg font-medium transition-all duration-200"
        >
          View Project Details
        </motion.button>
      </div>
    </motion.div>
  );
}