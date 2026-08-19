'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patch, del } from '@/lib/api';
import { useNotifications, useMarkAllRead, useUnreadCount } from '@/lib/hooks';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
    MessageSquare,
  FileText,
  DollarSign,
  Flag,
  UserPlus,
  Briefcase,
  ListTodo,
  Inbox,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/components/ui/cn';
import type { Notification } from '@hexa-hub/types';

// ─── Type Config ────────────────────────────────────────────────────────────

interface TypeStyle {
  icon: React.ElementType;
  bg: string;
  text: string;
  dotColor: string;
}

const typeConfig: Record<string, TypeStyle> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-success/10',
    text: 'text-success',
    dotColor: 'bg-emerald-400',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-error/10',
    text: 'text-error',
    dotColor: 'bg-red-400',
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    text: 'text-info',
    dotColor: 'bg-blue-400',
  },
  message: {
    icon: MessageSquare,
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    dotColor: 'bg-violet-400',
  },
  document: {
    icon: FileText,
    bg: 'bg-neutral-500/10',
    text: 'text-tertiary',
    dotColor: 'bg-neutral-400',
  },
  invoice: {
    icon: DollarSign,
    bg: 'bg-gold/10',
    text: 'text-gold',
    dotColor: 'bg-gold',
  },
  project: {
    icon: Briefcase,
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    dotColor: 'bg-sky-400',
  },
  task: {
    icon: ListTodo,
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    dotColor: 'bg-teal-400',
  },
  milestone: {
    icon: Flag,
    bg: 'bg-success/10',
    text: 'text-success',
    dotColor: 'bg-emerald-400',
  },
  invite: {
    icon: UserPlus,
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    dotColor: 'bg-cyan-400',
  },
};

const defaultTypeConfig: TypeStyle = {
  icon: Bell,
  bg: 'bg-neutral-500/10',
  text: 'text-tertiary',
  dotColor: 'bg-neutral-400',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ─── Filter Tabs ────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread' | 'read';

interface FilterTabsProps {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
  unreadCount: number;
}

function FilterTabs({ active, onChange, unreadCount }: FilterTabsProps) {
  const tabs: { key: FilterTab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'unread', label: 'Unread', icon: Eye, count: unreadCount },
    { key: 'read', label: 'Read', icon: EyeOff },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-void-deep border border-border rounded-xl">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            whileHover={!isActive ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-light transition-all duration-200',
              isActive
                ? 'bg-gold/10 text-gold shadow-[0_0_12px_rgba(212, 175, 55,0.08)]'
                : 'text-tertiary hover:text-secondary',
            )}
          >
            <Icon size={14} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none',
                  isActive
                    ? 'bg-gold/20 text-gold'
                    : 'bg-surface text-tertiary',
                )}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="filter-active-tab"
                className="absolute inset-0 rounded-lg bg-gold/10 border border-gold/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  const config: Record<FilterTab, { icon: React.ElementType; title: string; description: string }> = {
    all: {
      icon: Inbox,
      title: 'No notifications yet',
      description: 'When you receive notifications, they will appear here.',
    },
    unread: {
      icon: CheckCheck,
      title: 'All caught up',
      description: 'You have no unread notifications. Great work!',
    },
    read: {
      icon: EyeOff,
      title: 'No read notifications',
      description: 'Notifications you have read will appear here.',
    },
  };

  const { icon: Icon, title, description } = config[filter];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative mb-6">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-gold/5 blur-2xl scale-150" />
        <div className="relative w-20 h-20 rounded-full bg-void-deep border border-border flex items-center justify-center">
          <Icon size={28} className="text-tertiary" />
        </div>
      </div>
      <h3 className="text-lg font-serif text-foreground font-light mb-1.5">{title}</h3>
      <p className="text-sm text-tertiary font-light max-w-xs text-center leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

// ─── Notification Row ───────────────────────────────────────────────────────

interface NotificationRowProps {
  notification: Notification;
  index: number;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationRow({ notification, index, onMarkRead, onDelete }: NotificationRowProps) {
  const cfg = notification.channel
    ? typeConfig[notification.channel] ?? defaultTypeConfig
    : defaultTypeConfig;
  const Icon = cfg.icon;
  const isUnread = !notification.read;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group flex items-start gap-4 px-6 py-4 transition-all duration-200',
        'border-b border-border last:border-0',
        isUnread
          ? 'bg-gold/[0.02] border-l-2 border-l-gold'
          : 'hover:bg-white/[0.01]',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200',
          cfg.bg,
          isHovered && 'scale-105',
        )}
      >
        <Icon size={15} className={cfg.text} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm leading-snug',
                isUnread ? 'text-foreground font-medium' : 'text-secondary font-light',
              )}
            >
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-xs text-tertiary mt-1 font-light leading-relaxed line-clamp-2">
                {notification.body}
              </p>
            )}
          </div>

          {/* Actions — visible on hover */}
          <div
            className={cn(
              'flex items-center gap-1 shrink-0 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          >
            {isUnread && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onMarkRead(notification.id)}
                className="p-1.5 rounded-lg text-tertiary hover:text-gold hover:bg-white/[0.04] transition-colors"
                title="Mark as read"
                aria-label="Mark as read"
              >
                <CheckCheck size={14} />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(notification.id)}
              className="p-1.5 rounded-lg text-tertiary hover:text-error hover:bg-error/5 transition-colors"
              title="Delete"
              aria-label="Delete notification"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 mt-1.5">
          <Clock size={11} className="text-tertiary" />
          <span className="text-[11px] text-tertiary font-light">
            {notification.createdAt ? formatRelativeTime(notification.createdAt) : '—'}
          </span>
          {isUnread && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const queryClient = useQueryClient();

  // Build filter params
  const filterParams: Record<string, unknown> | undefined =
    filter === 'all'
      ? undefined
      : { read: filter === 'read' ? 'true' : 'false' };

  const { data: notifications, isLoading, isError, refetch } = useNotifications(filterParams);
  const { count: unreadCount } = useUnreadCount();
  const markAllRead = useMarkAllRead();

  // Single mark-read mutation
  const markOneReadMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => patch<void>(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Single delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => del<void>(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAllRead = useCallback(async () => {
    markAllRead.mutate(undefined);
  }, [markAllRead]);

  const handleMarkOneRead = useCallback(
    (id: string) => {
      markOneReadMutation.mutate(id);
    },
    [markOneReadMutation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const resolvedNotifications = notifications ?? [];
  const hasNotifications = resolvedNotifications.length > 0;

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-serif font-light">
              <span className="text-gold">Notifications</span>
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-[11px] font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 rounded-lg text-tertiary hover:text-secondary hover:bg-white/[0.04] transition-colors"
              title="Refresh"
              aria-label="Refresh notifications"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </motion.button>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllRead}
                disabled={markAllRead.isLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-all disabled:opacity-40 font-light"
              >
                {markAllRead.isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                ) : (
                  <CheckCheck size={14} />
                )}
                Mark All Read
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-tertiary font-light text-sm">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
            : 'You are all caught up.'}
        </p>

        {/* Gold divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6"
      >
        <FilterTabs active={filter} onChange={setFilter} unreadCount={unreadCount} />
      </motion.div>

      {/* Notification List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-void-deep border border-border rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          /* Loading skeleton */
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-surface shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3.5 bg-surface rounded w-2/3" />
                  <div className="h-2.5 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-error/5 border border-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-error/60" />
            </div>
            <p className="text-sm text-error font-light mb-1">Failed to load notifications</p>
            <p className="text-xs text-tertiary font-light mb-4">
              Please check your connection and try again
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="px-4 py-2 text-xs text-tertiary border border-neutral-700 rounded-lg hover:border-neutral-500 hover:text-neutral-200 transition-all font-light"
            >
              Try Again
            </motion.button>
          </div>
        ) : !hasNotifications ? (
          /* Empty state */
          <EmptyState filter={filter} />
        ) : (
          /* Notification rows */
          <AnimatePresence mode="popLayout">
            {resolvedNotifications.map((notif, i) => (
              <NotificationRow
                key={notif.id}
                notification={notif}
                index={i}
                onMarkRead={handleMarkOneRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Footer info */}
      {hasNotifications && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-tertiary font-light mt-6"
        >
          Showing {resolvedNotifications.length} notification{resolvedNotifications.length === 1 ? '' : 's'}
          {filter !== 'all' && ` (${filter})`}
        </motion.p>
      )}
    </div>
  );
}
