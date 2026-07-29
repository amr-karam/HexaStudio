'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Flag, User, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimelineTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'overdue' | 'upcoming';
  assignee?: string;
  isMilestone?: boolean;
}

interface ProjectTimelineProps {
  tasks: TimelineTask[];
  projectStart: string;
  projectEnd: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; fill: string; text: string }> = {
  completed: { bg: 'bg-emerald-500/10', fill: 'bg-emerald-500', text: 'text-emerald-400' },
  in_progress: { bg: 'bg-amber-500/10', fill: 'bg-amber-500', text: 'text-amber-400' },
  overdue: { bg: 'bg-red-500/10', fill: 'bg-red-500', text: 'text-red-400' },
  upcoming: { bg: 'bg-neutral-500/10', fill: 'bg-neutral-500', text: 'text-neutral-400' },
};

const DAY_MS = 86400000;
const LABEL_COLUMN_WIDTH = 220;

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonthLabels(start: Date, end: Date): { label: string; left: number; width: number }[] {
  const months: { label: string; left: number; width: number }[] = [];
  const totalDays = daysBetween(start, end);
  let cursor = new Date(start);
  while (cursor <= end) {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const clampedStart = monthStart < start ? start : monthStart;
    const clampedEnd = monthEnd > end ? end : monthEnd;
    const left = (daysBetween(start, clampedStart) / totalDays) * 100;
    const width = (daysBetween(clampedStart, clampedEnd) / totalDays) * 100;
    months.push({
      label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      left,
      width: Math.max(width, 0.5),
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return months;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

export const MOCK_TIMELINE_TASKS: TimelineTask[] = [
  { id: '1', title: 'Discovery & Research', startDate: '2026-06-01', endDate: '2026-06-14', progress: 100, status: 'completed', assignee: 'Sarah Chen' },
  { id: '2', title: 'Wireframing', startDate: '2026-06-10', endDate: '2026-06-24', progress: 100, status: 'completed', assignee: 'Marcus Webb' },
  { id: '3', title: 'UI Design', startDate: '2026-06-20', endDate: '2026-07-15', progress: 75, status: 'in_progress', assignee: 'Aisha Khan' },
  { id: '4', title: 'Frontend Development', startDate: '2026-07-01', endDate: '2026-08-10', progress: 40, status: 'in_progress', assignee: 'David Park' },
  { id: '5', title: 'Backend API', startDate: '2026-07-05', endDate: '2026-08-05', progress: 55, status: 'in_progress', assignee: 'James Liu' },
  { id: '6', title: 'Client Review v1', startDate: '2026-07-15', endDate: '2026-07-15', progress: 0, status: 'upcoming', isMilestone: true },
  { id: '7', title: 'QA Testing', startDate: '2026-08-01', endDate: '2026-08-20', progress: 0, status: 'upcoming', assignee: 'Elena Rossi' },
  { id: '8', title: 'Content Migration', startDate: '2026-07-20', endDate: '2026-08-15', progress: 10, status: 'upcoming', assignee: 'Omar Hassan' },
  { id: '9', title: 'Client Review v2', startDate: '2026-08-20', endDate: '2026-08-20', progress: 0, status: 'upcoming', isMilestone: true },
  { id: '10', title: 'Launch', startDate: '2026-09-01', endDate: '2026-09-01', progress: 0, status: 'upcoming', isMilestone: true },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProjectTimeline({
  tasks = MOCK_TIMELINE_TASKS,
  projectStart = '2026-06-01',
  projectEnd = '2026-09-15',
}: ProjectTimelineProps) {
  const start = useMemo(() => new Date(projectStart), [projectStart]);
  const end = useMemo(() => new Date(projectEnd), [projectEnd]);
  const totalDays = useMemo(() => daysBetween(start, end), [start, end]);
  const months = useMemo(() => getMonthLabels(start, end), [start, end]);
  const today = useMemo(() => new Date(), []);
  const todayLeft = useMemo(() => {
    if (today < start || today > end) return -1;
    return (daysBetween(start, today) / totalDays) * 100;
  }, [today, start, end, totalDays]);

  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const getBarStyle = (task: TimelineTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const left = (daysBetween(start, taskStart) / totalDays) * 100;
    const width = Math.max((daysBetween(taskStart, taskEnd) / totalDays) * 100, 0.3);
    return { left: `${left}%`, width: `${width}%` };
  };

  const handleMouseEnter = (task: TimelineTask, e: React.MouseEvent) => {
    setHoveredTask(task.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Scroll Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[11px] text-[#555]">
          <Calendar size={13} />
          <span>{formatDate(start)} — {formatDate(end)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll('left')} className="p-1.5 rounded-lg hover:bg-white/[0.03] text-[#555] hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} className="p-1.5 rounded-lg hover:bg-white/[0.03] text-[#555] hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div ref={scrollRef} className="overflow-x-auto rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A]">
        <div className="min-w-[800px]">
          {/* Month Header */}
          <div className="relative h-10 border-b border-[#1F1F1F] bg-[#0A0A0A]">
            <div style={{ width: LABEL_COLUMN_WIDTH }} className="absolute left-0 top-0 h-full border-r border-[#1F1F1F] flex items-center px-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#555]">Task</span>
            </div>
            <div className="ml-[220px] relative h-full">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-center border-l border-[#1F1F1F] px-2"
                  style={{ left: `${m.left}%`, width: `${m.width}%` }}
                >
                  <span className="text-[10px] text-[#555] font-medium tracking-wider">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today Indicator */}
          {todayLeft >= 0 && (
            <div className="absolute top-10 bottom-0 z-10 pointer-events-none" style={{ left: `${LABEL_COLUMN_WIDTH + (todayLeft * (100 - LABEL_COLUMN_WIDTH / 8)) / 100}%` }}>
              <div className="w-px h-full bg-[#D4A843]/40" style={{ backgroundImage: 'linear-gradient(to bottom, #D4A843 50%, transparent 50%)', backgroundSize: '1px 8px' }} />
              <div className="absolute -top-1 -left-[5px] w-2.5 h-2.5 rounded-full bg-[#D4A843]" />
            </div>
          )}

          {/* Task Rows */}
          <div className="relative">
            {tasks.map((task, i) => {
              const colors = STATUS_COLORS[task.status] ?? STATUS_COLORS.upcoming;
              const barStyle = getBarStyle(task);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="relative flex border-b border-[#1F1F1F] last:border-b-0 hover:bg-white/[0.01] transition-colors"
                  style={{ minHeight: task.isMilestone ? 40 : 48 }}
                >
                  {/* Label Column */}
                  <div
                    className="absolute left-0 top-0 h-full flex items-center gap-2 px-4 border-r border-[#1F1F1F] bg-[#0A0A0A] z-[5]"
                    style={{ width: LABEL_COLUMN_WIDTH }}
                  >
                    {task.isMilestone ? (
                      <Flag size={13} className="text-[#D4A843] shrink-0" />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.fill} shrink-0`} />
                    )}
                    <span className="text-xs text-white font-light truncate">{task.title}</span>
                  </div>

                  {/* Bar Area */}
                  <div className="ml-[220px] relative flex-1 flex items-center">
                    {task.isMilestone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.2, type: 'spring' }}
                        className="absolute top-1/2 -translate-y-1/2 z-[2]"
                        style={{ left: barStyle.left }}
                      >
                        <div className="w-5 h-5 rotate-45 bg-[#D4A843] rounded-sm shadow-[0_0_12px_rgba(212,168,67,0.3)]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                        className="absolute top-1/2 -translate-y-1/2 h-5 rounded-full cursor-pointer group z-[2]"
                        style={{ left: barStyle.left, width: barStyle.width, transformOrigin: 'left center' }}
                        onMouseEnter={(e) => handleMouseEnter(task, e)}
                        onMouseLeave={() => setHoveredTask(null)}
                      >
                        {/* Background bar */}
                        <div className={`absolute inset-0 rounded-full ${colors.bg}`} />
                        {/* Progress fill */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ delay: i * 0.05 + 0.5, duration: 0.8, ease: 'easeOut' }}
                          className={`absolute inset-y-0 left-0 rounded-full ${colors.fill} opacity-80`}
                        />
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredTask && (() => {
          const task = tasks.find(t => t.id === hoveredTask);
          if (!task || task.isMilestone) return null;
          const colors = STATUS_COLORS[task.status];
          return (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              className="fixed z-50 pointer-events-none bg-[#141414] border border-[#1F1F1F] rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[200px]"
              style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, -100%)' }}
            >
              <p className="text-sm text-white font-medium mb-1">{task.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-[#666] mb-1">
                <Clock size={11} />
                <span>{formatDate(new Date(task.startDate))} — {formatDate(new Date(task.endDate))}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className="text-[#555]">{task.progress}% complete</span>
              </div>
              {task.assignee && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#555]">
                  <User size={11} />
                  <span>{task.assignee}</span>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 px-1">
        {Object.entries(STATUS_COLORS).map(([key, colors]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${colors.fill}`} />
            <span className="text-[10px] text-[#555] capitalize">{key.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-3 h-3 rotate-45 bg-[#D4A843] rounded-sm" />
          <span className="text-[10px] text-[#555]">Milestone</span>
        </div>
      </div>
    </div>
  );
}
