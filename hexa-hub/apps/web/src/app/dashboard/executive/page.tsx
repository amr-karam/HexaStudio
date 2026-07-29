'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, FolderKanban, Users, Target,
  Star, Clock, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Activity, Calendar, ChevronRight,
} from 'lucide-react';

// ─── Animated Counter ───────────────────────────────────────────────────────

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.5 }: {
  value: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const formatted = value >= 1000
    ? `${prefix}${(count / 1000).toFixed(count === value ? 1 : 0)}k${suffix}`
    : `${prefix}${count.toLocaleString()}${suffix}`;

  return <span ref={ref}>{formatted}</span>;
}

// ─── SVG Donut Chart ────────────────────────────────────────────────────────

function DonutChart({ value, total, size = 80, strokeWidth = 6, color = '#D4A843' }: {
  value: number; total: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / total) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#1F1F1F" strokeWidth={strokeWidth} />
      <motion.circle
        cx={center} cy={center} r={radius} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - progress }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="300" fontFamily="serif">
        {Math.round((value / total) * 100)}%
      </text>
    </svg>
  );
}

// ─── SVG Bar Chart ──────────────────────────────────────────────────────────

function RevenueChart() {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const data = [42, 38, 55, 62, 48, 71, 68, 82, 75, 89, 94, 85];
  const max = Math.max(...data);
  const chartH = 180;
  const chartW = 600;
  const padL = 40;
  const padB = 24;
  const barW = (chartW - padL) / data.length - 8;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${chartW} ${chartH + padB}`} className="w-full" style={{ minWidth: 500 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1={padL} y1={chartH - (v / 100) * chartH} x2={chartW} y2={chartH - (v / 100) * chartH}
            stroke="#1F1F1F" strokeWidth="0.5" />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d / max) * chartH;
          const x = padL + i * ((chartW - padL) / data.length) + 4;
          return (
            <g key={i}>
              <motion.rect
                x={x} y={chartH} width={barW} height={0}
                fill="url(#barGrad)" rx={3}
                initial={{ y: chartH, height: 0 }}
                animate={{ y: chartH - barH, height: barH }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.text x={x + barW / 2} y={chartH - barH - 6} textAnchor="middle"
                fill="#888" fontSize="9" fontFamily="Inter, sans-serif"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 + 0.4 }}>
                ${d}k
              </motion.text>
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill="#555" fontSize="9" fontFamily="Inter, sans-serif">
                {months[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Star Rating ────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}>
          <Star size={14} fill={i <= Math.floor(rating) ? '#D4A843' : 'none'}
            stroke={i <= Math.floor(rating) ? '#D4A843' : '#333'} />
        </motion.div>
      ))}
      <span className="text-xs text-[#888] ml-1.5 font-light">{rating}/5</span>
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, prefix, suffix, trend, trendLabel, color = '#D4A843' }: {
  icon: typeof TrendingUp; label: string; value: number; prefix?: string; suffix?: string;
  trend?: 'up' | 'down'; trendLabel?: string; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 hover:border-[#D4A843]/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={17} style={{ color }} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-1">{label}</p>
      <p className="text-2xl font-serif font-light text-white">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </p>
    </motion.div>
  );
}

// ─── Activity Item ──────────────────────────────────────────────────────────

const ACTIVITIES = [
  { icon: DollarSign, text: 'Invoice #INV-2024-089 paid', detail: '$12,400', time: '2 hours ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: CheckCircle2, text: 'Project \'Brand Refresh\' completed', detail: '', time: '5 hours ago', color: 'text-[#D4A843]', bg: 'bg-[#D4A843]/10' },
  { icon: TrendingUp, text: 'Lead \'TechCorp\' converted to client', detail: '', time: '1 day ago', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: CheckCircle2, text: 'Task \'API Integration\' completed', detail: 'by Sarah Chen', time: '1 day ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Target, text: 'Milestone \'Design Phase\' reached', detail: '', time: '2 days ago', color: 'text-[#D4A843]', bg: 'bg-[#D4A843]/10' },
];

// ─── Team Row ────────────────────────────────────────────────────────────────

const TEAM = [
  { name: 'Sarah Chen', dept: 'Design', hours: 142, tasks: 28, util: 92 },
  { name: 'Marcus Webb', dept: 'Engineering', hours: 138, tasks: 24, util: 88 },
  { name: 'Aisha Khan', dept: 'Design', hours: 128, tasks: 22, util: 82 },
  { name: 'David Park', dept: 'Engineering', hours: 145, tasks: 31, util: 95 },
  { name: 'Elena Rossi', dept: 'QA', hours: 110, tasks: 18, util: 71 },
];

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ExecutiveDashboardPage() {
  return (
    <div className="p-4 md:p-8 lg:p-10 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#666] mb-3">
          <Activity size={13} />
          <span>Executive View</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-light text-white mb-1">Analytics Dashboard</h1>
        <p className="text-[13px] text-[#666] font-light">Real-time business intelligence across all operations</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <KpiCard icon={DollarSign} label="Total Revenue" value={847200} prefix="$" trend="up" trendLabel="12.4%" color="#D4A843" />
        <KpiCard icon={FolderKanban} label="Active Projects" value={24} color="#60A5FA" />
        <KpiCard icon={Users} label="Team Utilization" value={78} suffix="%" color="#34D399" />
        <KpiCard icon={Target} label="Pipeline Value" value={1200000} prefix="$" trend="up" trendLabel="8.7%" color="#A78BFA" />
      </motion.div>

      {/* Revenue Chart + Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Revenue Overview</h3>
              <p className="text-[11px] text-[#555]">Last 12 months</p>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1"><ArrowUpRight size={12} /> +18.2% YoY</span>
          </div>
          <RevenueChart />
        </motion.div>

        {/* Project Health */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Project Health</h3>
          <div className="space-y-4">
            {/* On Track vs At Risk */}
            <div className="flex items-center gap-3">
              <DonutChart value={18} total={24} size={56} strokeWidth={5} color="#34D399" />
              <div>
                <p className="text-xs text-[#888]">On Track</p>
                <p className="text-lg font-serif text-white">18 <span className="text-xs text-[#555]">/ 24</span></p>
              </div>
            </div>
            {/* Task Completion */}
            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-[#888]">Task Completion</span>
                <span className="text-[#D4A843]">67%</span>
              </div>
              <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '67%' }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-[#D4A843] rounded-full" />
              </div>
            </div>
            {/* Client Satisfaction */}
            <div>
              <p className="text-[11px] text-[#888] mb-1.5">Client Satisfaction</p>
              <StarRating rating={4.8} />
            </div>
            {/* Upcoming Deadlines */}
            <div>
              <p className="text-[11px] text-[#888] mb-2">Upcoming Deadlines</p>
              {[
                { name: 'Brand Refresh v2', date: 'Aug 5', days: 7 },
                { name: 'API Documentation', date: 'Aug 12', days: 14 },
                { name: 'Q3 Review', date: 'Aug 18', days: 20 },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1F1F1F] last:border-0">
                  <span className="text-xs text-white font-light">{d.name}</span>
                  <span className="text-[10px] text-[#555]">{d.date} · {d.days}d</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Feed + Team Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Recent Activity</h3>
            <button className="text-[11px] text-[#D4A843] hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-0">
            {ACTIVITIES.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-start gap-3 py-3 border-b border-[#1F1F1F] last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.bg}`}>
                    <Icon size={13} className={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-light">{a.text}</p>
                    {a.detail && <p className="text-[10px] text-[#555]">{a.detail}</p>}
                  </div>
                  <span className="text-[10px] text-[#555] shrink-0">{a.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team Performance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  {['Name', 'Dept', 'Hours', 'Tasks', 'Util.'].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-[#555] font-medium pb-2 px-2 first:pl-0 last:pr-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM.map((t, i) => (
                  <motion.tr key={t.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="border-b border-[#1F1F1F] last:border-0">
                    <td className="py-2.5 px-2 first:pl-0 text-xs text-white font-light">{t.name}</td>
                    <td className="py-2.5 px-2 text-[11px] text-[#666]">{t.dept}</td>
                    <td className="py-2.5 px-2 text-[11px] text-[#888]">{t.hours}h</td>
                    <td className="py-2.5 px-2 text-[11px] text-[#888]">{t.tasks}</td>
                    <td className="py-2.5 px-2 last:pr-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${t.util}%` }}
                            transition={{ duration: 0.8, delay: 0.7 + i * 0.05 }}
                            className={`h-full rounded-full ${t.util > 90 ? 'bg-red-500' : t.util > 75 ? 'bg-[#D4A843]' : 'bg-emerald-500'}`} />
                        </div>
                        <span className="text-[10px] text-[#888] w-8 text-right">{t.util}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
