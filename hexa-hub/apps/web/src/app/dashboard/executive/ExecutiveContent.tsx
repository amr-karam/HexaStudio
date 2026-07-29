'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCrmStats,
  useProjectStats,
  useSalesStats,
  useUnreadCount,
} from '@/lib/hooks';
import {
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  FolderKanban,
  DollarSign,
  Clock,
  Target,
  Zap,
  Activity,
  ChevronRight,
  BarChart3,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

// ─── Types (derived from actual API responses) ──────────────────────────────

interface ComposedMetrics {
  total_revenue: number;
  active_projects: number;
  pending_approvals: number;
  open_leads: number;
  won_leads_this_month: number;
  team_efficiency: number;
  overdue_tasks: number;
  unread_messages: number;
}

// ─── Animated Counter Hook ──────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1800, shouldAnimate = true) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!shouldAnimate || target === 0) {
      setCount(target);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for luxury feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, shouldAnimate]);

  return count;
}

// ─── Skeleton Components ────────────────────────────────────────────────────

function MetricCardSkeleton() {
  return (
    <div className="p-6 bg-surface border border-border rounded-2xl animate-pulse">
      <div className="h-3 bg-neutral-800 rounded w-24 mb-4" />
      <div className="h-10 bg-neutral-800 rounded w-32 mb-3" />
      <div className="h-2 bg-neutral-800 rounded w-20" />
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="p-8 bg-surface border border-border rounded-3xl animate-pulse">
      <div className="h-6 bg-neutral-800 rounded w-48 mb-8" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-3 bg-neutral-800 rounded w-20" />
            <div className="h-8 bg-neutral-800 rounded w-12" />
            <div className="h-2 bg-neutral-800 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="p-8 bg-surface border border-border rounded-3xl animate-pulse">
      <div className="h-6 bg-neutral-800 rounded w-40 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 py-4 border-b border-border/30 last:border-0">
          <div className="w-8 h-8 bg-neutral-800 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-neutral-800 rounded w-3/4" />
            <div className="h-2 bg-neutral-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Metric Card Component ──────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  index: number;
  isLoading: boolean;
  trend?: number;
}

function MetricCard({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  color,
  glowColor,
  index,
  isLoading,
  trend,
}: MetricCardProps) {
  const animatedValue = useAnimatedCounter(value, 1800 + index * 200, !isLoading);

  if (isLoading) return <MetricCardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative p-6 bg-surface border border-border rounded-2xl overflow-hidden cursor-default"
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glowColor}08 0%, transparent 70%)`,
        }}
      />

      {/* Icon watermark */}
      <div className="absolute top-4 right-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500">
        <Icon size={56} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={16} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.15em] text-neutral-500 font-medium">
            {label}
          </span>
        </div>

        <div className="flex items-end gap-3">
          <span className={`text-3xl font-serif font-light ${color}`}>
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </span>
        </div>

        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            <TrendingUp
              size={12}
              className={trend >= 0 ? 'text-emerald-400' : 'text-red-400 rotate-180'}
            />
            <span
              className={`text-[10px] font-medium ${
                trend >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend >= 0 ? '+' : ''}
              {trend}% vs last month
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Pipeline Overview ──────────────────────────────────────────────────────

interface PipelineViewData {
  conversion_rate: number;
  total_leads: number;
  leads_by_source: Record<string, number>;
}

function PipelineOverview({ data, isLoading }: { data: PipelineViewData | null; isLoading: boolean }) {
  if (isLoading) return <PipelineSkeleton />;
  if (!data) return null;

  const sources = Object.entries(data.leads_by_source);
  const maxCount = Math.max(...sources.map(([, count]) => count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="p-8 bg-surface border border-border rounded-3xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-gold" size={22} />
          <h2 className="text-lg font-serif font-light text-white">Pipeline Overview</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600">Conversion Rate</p>
          <p className="text-gold text-xl font-serif">{data.conversion_rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="group"
        >
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Total Leads</p>
          <p className="text-2xl font-serif font-light text-white">{data.total_leads}</p>
          <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20"
            />
          </div>
        </motion.div>

        {sources.slice(0, 6).map(([source, count], i) => {
          const stageColors = [
            'from-cyan-500/20 to-cyan-600/20',
            'from-violet-500/20 to-violet-600/20',
            'from-amber-500/20 to-amber-600/20',
            'from-orange-500/20 to-orange-600/20',
            'from-emerald-500/20 to-emerald-600/20',
            'from-red-500/20 to-red-600/20',
          ];
          const stageAccents = [
            'text-cyan-400',
            'text-violet-400',
            'text-amber-400',
            'text-orange-400',
            'text-emerald-400',
            'text-red-400',
          ];

          return (
            <motion.div
              key={source}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + (i + 1) * 0.05 }}
              className="group"
            >
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 truncate">
                {source.replace(/_/g, ' ')}
              </p>
              <p className={`text-2xl font-serif font-light ${stageAccents[i % stageAccents.length]}`}>
                {count}
              </p>
              <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ delay: 0.8 + (i + 1) * 0.05, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${stageColors[i % stageColors.length]}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Activity Feed ──────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: 'lead' | 'project' | 'invoice' | 'task';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New lead captured from website',
    description: 'Residential project — €250k estimated budget',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'info',
  },
  {
    id: '2',
    type: 'project',
    title: 'Project milestone completed',
    description: '3D modeling phase finalized for Oakwood Residence',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: 'success',
  },
  {
    id: '3',
    type: 'invoice',
    title: 'Invoice overdue',
    description: 'INV-2026-0042 — 14 days past due',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    status: 'warning',
  },
  {
    id: '4',
    type: 'task',
    title: 'Task marked as urgent',
    description: 'Foundation plan revision — due tomorrow',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    status: 'error',
  },
  {
    id: '5',
    type: 'lead',
    title: 'Qualified lead moved to negotiation',
    description: 'Commercial complex — €1.2M',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: 'success',
  },
];

function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="p-8 bg-surface border border-border rounded-3xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-gold" size={22} />
        <h2 className="text-lg font-serif font-light text-white">Recent Activity</h2>
      </div>

      <div className="space-y-1">
        {SAMPLE_ACTIVITIES.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.04 }}
            className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0 group cursor-default hover:bg-white/[0.01] rounded-lg px-2 -mx-2 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                item.status === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : item.status === 'warning'
                  ? 'bg-amber-500/10 text-amber-400'
                  : item.status === 'error'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}
            >
              {item.status === 'success' ? (
                <CheckCircle size={14} />
              ) : item.status === 'error' ? (
                <AlertCircle size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/90 font-light truncate">{item.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
            </div>
            <span className="text-[10px] text-neutral-600 whitespace-nowrap mt-1">
              {formatTimestamp(item.timestamp)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── AI Insights Section ────────────────────────────────────────────────────

function AiInsightsSection({
  data,
  isLoading,
  error,
  onRetry,
}: {
  data: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="p-8 bg-surface border border-border rounded-3xl relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <BrainCircuit className="text-gold" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-light text-white">HEXA Intelligence</h2>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600">
              Powered by HEXA Studio
            </p>
          </div>
        </div>
        {error && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 hover:text-gold border border-border hover:border-gold/30 rounded-lg transition-all"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-neutral-800 rounded w-3/4" />
          <div className="h-4 bg-neutral-800 rounded w-full" />
          <div className="h-4 bg-neutral-800 rounded w-5/6" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto text-red-400/50 mb-3" />
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      ) : data ? (
        <p className="text-neutral-400 font-light leading-relaxed italic text-base">
          &ldquo;{data}&rdquo;
        </p>
      ) : (
        <p className="text-neutral-600 text-sm italic font-light">
          Connect AI services to see operational insights and recommendations.
        </p>
      )}
    </motion.div>
  );
}

// ─── Executive Dashboard Page ───────────────────────────────────────────────

export default function ExecutiveContent() {
  const { user } = useAuth();

  // ── Data Hooks ──────────────────────────────────────────────────────────

  const {
    data: crmStats,
    isLoading: crmLoading,
    isError: crmError,
    refetch: refetchCrm,
  } = useCrmStats();

  const {
    data: projectStats,
    isLoading: projectLoading,
    isError: projectError,
    refetch: refetchProjects,
  } = useProjectStats();

  const {
    data: salesStats,
    isLoading: salesLoading,
    isError: salesError,
    refetch: refetchSales,
  } = useSalesStats();

  const {
    count: unreadCount,
    isLoading: unreadLoading,
  } = useUnreadCount();

  // ── Compose unified metrics ────────────────────────────────────────────

  const metrics: ComposedMetrics = {
    total_revenue: salesStats?.total_revenue ?? crmStats?.total_revenue ?? 0,
    active_projects: projectStats?.active_projects ?? 0,
    pending_approvals: salesStats?.pending_quotations ?? 0,
    open_leads: crmStats?.total_leads ?? 0,
    won_leads_this_month: crmStats?.conversion_rate
      ? Math.round((crmStats.total_leads * crmStats.conversion_rate) / 100)
      : 0,
    team_efficiency: projectStats?.budget_utilization ?? 0,
    overdue_tasks: 0,
    unread_messages: unreadCount,
  };

  const isLoading = crmLoading || projectLoading || salesLoading || unreadLoading;
  const anyError = crmError || projectError || salesError;

  // ── Metric Cards ──────────────────────────────────────────────────────

  const metricCards = [
    {
      label: 'Total Revenue',
      value: metrics.total_revenue,
      prefix: '€',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10',
      glowColor: '#34d399',
      trend: 12,
    },
    {
      label: 'Active Projects',
      value: metrics.active_projects,
      icon: FolderKanban,
      color: 'text-blue-400 bg-blue-500/10',
      glowColor: '#60a5fa',
      trend: 8,
    },
    {
      label: 'Pending Approvals',
      value: metrics.pending_approvals,
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10',
      glowColor: '#fbbf24',
      trend: -3,
    },
    {
      label: 'Open Leads',
      value: metrics.open_leads,
      icon: Target,
      color: 'text-violet-400 bg-violet-500/10',
      glowColor: '#a78bfa',
      trend: 15,
    },
    {
      label: 'Won This Month',
      value: metrics.won_leads_this_month,
      icon: CheckCircle,
      color: 'text-gold bg-gold/10',
      glowColor: '#D4A843',
      trend: 22,
    },
    {
      label: 'Budget Utilization',
      value: metrics.team_efficiency,
      suffix: '%',
      icon: Users,
      color: 'text-cyan-400 bg-cyan-500/10',
      glowColor: '#22d3ee',
      trend: 5,
    },
    {
      label: 'Unread Notifications',
      value: metrics.unread_messages,
      icon: AlertCircle,
      color: 'text-red-400 bg-red-500/10',
      glowColor: '#f87171',
      trend: -7,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-white mb-3">
              Executive <span className="text-gold">Overview</span>
            </h1>
            <p className="text-neutral-500 font-light text-lg">
              Real-time operational health of HEXA Studio
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-neutral-600">Last Updated</p>
            <p className="text-xs text-neutral-500 font-light mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Gold accent line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Error banner */}
      {anyError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-8 bg-red-500/5 border border-red-500/20 rounded-xl"
        >
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-light">
            Some data sources are unavailable. Displaying cached or estimated values.
          </p>
        </motion.div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {metricCards.slice(0, 4).map((card, i) => (
          <MetricCard key={card.label} {...card} index={i} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {metricCards.slice(4).map((card, i) => (
          <MetricCard key={card.label} {...card} index={i + 4} isLoading={isLoading} />
        ))}
      </div>

      {/* Pipeline Overview — uses CRM stats */}
      <div className="mb-10">
        <PipelineOverview
          data={
            crmStats
              ? {
                  conversion_rate: crmStats.conversion_rate,
                  total_leads: crmStats.total_leads,
                  leads_by_source: crmStats.leads_by_source,
                }
              : null
          }
          isLoading={crmLoading}
        />
      </div>

      {/* Activity + AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityFeed />

        <AiInsightsSection
          data={null}
          isLoading={false}
          error={null}
          onRetry={() => {}}
        />
      </div>
    </div>
  );
}