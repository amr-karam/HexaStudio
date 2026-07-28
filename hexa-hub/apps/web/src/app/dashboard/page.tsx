'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useProjectStats, useSalesStats, useUnreadCount } from '@/lib/hooks';
import { FolderKanban, FileCheck, MessageSquare, AlertCircle, type LucideIcon } from 'lucide-react';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function MetricCardSkeleton() {
  return (
    <div className="p-6 bg-surface border border-border rounded-2xl animate-pulse">
      <div className="h-3 bg-neutral-800 rounded w-24 mb-4" />
      <div className="h-10 bg-neutral-800 rounded w-20 mb-3" />
      <div className="h-2 bg-neutral-800 rounded w-16" />
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1600) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  index: number;
  isLoading: boolean;
  subtitle?: string;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  glowColor,
  index,
  isLoading,
  subtitle,
}: MetricCardProps) {
  const animatedValue = useAnimatedCounter(value, 1600 + index * 200);

  if (isLoading) return <MetricCardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative p-6 bg-surface border border-border rounded-2xl overflow-hidden cursor-default"
    >
      {/* Hover glow */}
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
            {animatedValue.toLocaleString()}
          </span>
        </div>

        {subtitle && (
          <p className="mt-2 text-xs text-neutral-600 font-light">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Quick Links ─────────────────────────────────────────────────────────────

const quickLinks = [
  { label: 'View Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Browse Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Sales Overview', href: '/dashboard/sales/quotations', icon: FileCheck },
];

function QuickLinks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="p-6 bg-surface border border-border rounded-2xl"
    >
      <h3 className="text-sm font-serif font-light text-white mb-4">Quick Access</h3>
      <div className="space-y-2">
        {quickLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-gold hover:bg-gold/5 transition-all duration-200"
          >
            <link.icon size={16} className="shrink-0" />
            <span className="font-light">{link.label}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    data: projectStats,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjectStats();

  const {
    data: salesStats,
    isLoading: salesLoading,
    isError: salesError,
  } = useSalesStats();

  const {
    count: unreadCount,
    isLoading: unreadLoading,
    isError: unreadError,
  } = useUnreadCount();

  const isLoading = projectsLoading || salesLoading || unreadLoading;

  const errorMessage =
    (projectsError && 'Project stats unavailable.') ||
    (salesError && 'Sales stats unavailable.') ||
    (unreadError && 'Notifications unavailable.') ||
    null;

  return (
    <div className="p-8 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
      >
        <h1 className="text-4xl font-serif font-light mb-2">
          Welcome back,{' '}
          <span className="text-gold">{user?.fullName || 'User'}</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Here is what&apos;s happening across your workspace today.
        </p>

        {/* Gold accent */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Error banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-8 bg-red-500/5 border border-red-500/20 rounded-xl"
        >
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-light">{errorMessage}</p>
        </motion.div>
      )}

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard
          label="Active Projects"
          value={projectStats?.active_projects ?? 0}
          icon={FolderKanban}
          color="text-blue-400 bg-blue-500/10"
          glowColor="#60a5fa"
          index={0}
          isLoading={isLoading}
          subtitle={projectsLoading ? undefined : `${projectStats?.total_projects ?? 0} total projects`}
        />
        <MetricCard
          label="Pending Approvals"
          value={(salesStats?.pending_quotations ?? 0) + (salesStats?.overdue_invoices ?? 0)}
          icon={FileCheck}
          color="text-amber-400 bg-amber-500/10"
          glowColor="#fbbf24"
          index={1}
          isLoading={isLoading}
          subtitle={
            salesLoading
              ? undefined
              : `${salesStats?.pending_quotations ?? 0} quotations · ${salesStats?.overdue_invoices ?? 0} overdue invoices`
          }
        />
        <MetricCard
          label="Unread Messages"
          value={unreadCount}
          icon={MessageSquare}
          color="text-violet-400 bg-violet-500/10"
          glowColor="#a78bfa"
          index={2}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <QuickLinks />

        {/* Revenue snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="lg:col-span-2 p-6 bg-surface border border-border rounded-2xl"
        >
          <h3 className="text-sm font-serif font-light text-white mb-4">Revenue Snapshot</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-serif font-light text-emerald-400">
                {salesLoading ? '...' : `€${(salesStats?.total_revenue ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Pending Quotations</p>
              <p className="text-2xl font-serif font-light text-gold">
                {salesLoading ? '...' : `€${(salesStats?.total_quotation_value ?? 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}