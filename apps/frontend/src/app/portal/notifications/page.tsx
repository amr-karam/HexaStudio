'use client';

/**
 * HEXA Portal v4.0 — Notification Center
 *
 * Premium notification hub with timeline-style connectors, color-coded type
 * indicators, inline expandable detail, filter tabs, and cinematic Framer
 * Motion choreography. Maintains local read/unread state independently of
 * the API for instant feedback.
 *
 * Features:
 * - Fetch via portalApi.getDashboard() with graceful mock fallback
 * - Filter tabs: All | Unread | Approval | Warning | Info
 * - Timeline connector dots colored by notification type
 * - Unread gold dot indicator
 * - Inline expandable detail with link navigation
 * - "Mark all as read" with confirmation readiness
 * - Gold shimmer skeleton for loading state
 * - Premium empty state with crossfade transitions
 * - Full ARIA compliance: list, listitem, tablist, live regions
 * - Reduced motion respect throughout
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Icon } from '@/features/portal/components/PortalIcons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { portalApi } from '@/features/portal/api';
import {
  fadeLift,
  staggerContainer,
  makeTransition,
  EASE,
  DURATION,
  STAGGER,
} from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { NotificationData, NotificationType } from '@/features/portal/types';
import type { IconName } from '@/features/portal/components/PortalIcons';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

type FilterTab = 'all' | 'unread' | 'approval' | 'warning' | 'info';

interface FilterOption {
  key: FilterTab;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'approval', label: 'Approval' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
];

/** Maps notification type → icon name used in PortalIcons. */
const TYPE_ICON_MAP: Record<NotificationType, IconName> = {
  approval: 'shield-check',
  success: 'check-circle',
  warning: 'alert-circle',
  error: 'x',
  info: 'bell',
};

/** Maps notification type → Tailwind color class for the connector dot. */
const TYPE_DOT_COLOR: Record<NotificationType, string> = {
  approval: 'border-accent bg-accent/20',
  success: 'border-emerald-400 bg-emerald-500/20',
  warning: 'border-amber-400 bg-amber-500/20',
  error: 'border-red-400 bg-red-500/20',
  info: 'border-blue-400 bg-blue-500/20',
};

/** Maps notification type → Tailwind color class for the icon. */
const TYPE_ICON_COLOR: Record<NotificationType, string> = {
  approval: 'text-accent',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  info: 'text-blue-400',
};

/** Maps notification type → background glow for the detail panel. */
const TYPE_GLOW_CLASS: Record<NotificationType, string> = {
  approval: 'bg-accent/[0.04]',
  success: 'bg-emerald-500/[0.04]',
  warning: 'bg-amber-500/[0.04]',
  error: 'bg-red-500/[0.04]',
  info: 'bg-blue-500/[0.04]',
};

/* -------------------------------------------------------------------------- */
/*  Mock Fallback Data                                                        */
/* -------------------------------------------------------------------------- */

const FALLBACK_NOTIFICATIONS: NotificationData[] = [
  {
    id: 'not-fb-1',
    type: 'approval',
    title: 'Design Review Required',
    message:
      '3D Exterior Renderings v2 package for Horizon Villa requires your sign-off. Please review the Vantage Point A & B renders before the Phase 2 deadline.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    link: '/portal/approvals',
  },
  {
    id: 'not-fb-2',
    type: 'success',
    title: 'Milestone Completed',
    message:
      'Phase 1: Concept Design has been marked as complete. All deliverables have been approved by the project team and archived.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isRead: false,
  },
  {
    id: 'not-fb-3',
    type: 'warning',
    title: 'Budget Threshold Alert',
    message:
      'Project spending has reached 75% of the allocated budget. Review detailed cost breakdown in the Finance Center to avoid overruns.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isRead: true,
    link: '/portal/finance',
  },
  {
    id: 'not-fb-4',
    type: 'info',
    title: 'New Team Member Added',
    message:
      'Sarah Chen (Lead Architect) has been assigned to the Horizon Villa project. She will oversee the structural design phase.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    isRead: true,
  },
  {
    id: 'not-fb-5',
    type: 'error',
    title: 'Document Upload Failed',
    message:
      'The file "structural-plans-v3.dwg" could not be uploaded due to an invalid format. Please convert to .pdf or .dwg v2020 and try again.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    isRead: false,
  },
  {
    id: 'not-fb-6',
    type: 'approval',
    title: 'Contract Amendment Pending',
    message:
      'The scope change request for additional lighting renders has been submitted for your approval. Estimated adjustment: +$3,200.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isRead: true,
    link: '/portal/approvals',
  },
  {
    id: 'not-fb-7',
    type: 'info',
    title: 'Scheduled Maintenance Notice',
    message:
      'HEXA Studio will perform scheduled platform maintenance on Saturday, August 1st from 02:00–04:00 UTC. Brief downtime is expected.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    isRead: true,
  },
  {
    id: 'not-fb-8',
    type: 'success',
    title: 'Invoice Paid',
    message:
      'Invoice #INV-2026-041 ($4,500.00) has been paid successfully. A receipt has been sent to your registered email address.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    isRead: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Returns a human-readable relative time string for the given ISO timestamp. */
function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return 'Unknown';
  const diffMs = now - then;
  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/** Maps a filter tab to the predicate that matches NotificationData items. */
function notificationMatchesFilter(
  notification: NotificationData,
  filter: FilterTab,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'unread') return !notification.isRead;
  if (filter === 'approval') return notification.type === 'approval';
  if (filter === 'warning') return notification.type === 'warning';
  if (filter === 'info') return notification.type === 'info' || notification.type === 'success' || notification.type === 'error';
  return true;
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

/** Gold shimmer skeleton for the loading state. */
function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading notifications" role="status">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border/20 bg-surface p-5 overflow-hidden relative"
        >
          {/* Animated gold shimmer overlay */}
          <div
            className="absolute inset-0 shimmer pointer-events-none"
            style={{ animationDelay: `${idx * 0.1}s` }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-start gap-4">
            {/* Skeleton dot */}
            <div className="w-[15px] h-[15px] rounded-full shrink-0 bg-white/[0.04] mt-1" />
            {/* Skeleton content */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="h-4 w-3/5 rounded bg-white/[0.04]" />
              <div className="h-3 w-full rounded bg-white/[0.02]" />
              <div className="h-3 w-2/3 rounded bg-white/[0.02]" />
              <div className="h-2.5 w-20 rounded bg-white/[0.03]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Premium empty state with crossfade entrance. */
function EmptyNotificationState({
  prefersReduced,
}: {
  prefersReduced: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={
        prefersReduced
          ? { duration: 0.01 }
          : { duration: DURATION.component, ease: EASE.transition }
      }
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-border/20 flex items-center justify-center">
          <Icon name="bell" size={32} className="text-neutral-600" />
        </div>
        {/* Subtle gold glow ring */}
        <div
          className="absolute -inset-2 rounded-[2.5rem] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold text-neutral-400">
        All caught up
      </h3>
      <p className="text-sm text-neutral-600 mt-1.5 max-w-[280px]">
        You have no pending notifications. We&apos;ll let you know when
        something needs your attention.
      </p>
    </motion.div>
  );
}

/** Error indicator pill shown when live data is unavailable. */
function LiveDataUnavailableBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={makeTransition('sharp', 'micro')}
      className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
      role="status"
      aria-label="Live data unavailable, showing sample data"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
      </span>
      Sample Data
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */

export default function NotificationCenterPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  /* ---- State ---- */
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ---- Data Fetching ---- */

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['portal-dashboard', 'notifications'],
    queryFn: () => portalApi.getDashboard(),
  });

  /* Merge API notifications with local read state, fallback to mock data */
  const allNotifications: NotificationData[] = useMemo(() => {
    if (isError || !data) return FALLBACK_NOTIFICATIONS;
    return data.notifications.length > 0
      ? data.notifications
      : FALLBACK_NOTIFICATIONS;
  }, [data, isError]);

  const isUsingFallback = isError || !data || data.notifications.length === 0;

  /* Derive local read flags from the API's isRead field merged with local toggles */
  const notificationsWithLocalRead: NotificationData[] = useMemo(
    () =>
      allNotifications.map((n) => ({
        ...n,
        isRead: readIds.has(n.id) ? true : n.isRead,
      })),
    [allNotifications, readIds],
  );

  /* Filtered list based on active tab */
  const filteredNotifications = useMemo(
    () =>
      notificationsWithLocalRead.filter((n) =>
        notificationMatchesFilter(n, activeFilter),
      ),
    [notificationsWithLocalRead, activeFilter],
  );

  const unreadCount = useMemo(
    () => notificationsWithLocalRead.filter((n) => !n.isRead).length,
    [notificationsWithLocalRead],
  );

  /* ---- Actions ---- */

  const handleMarkAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      allNotifications.forEach((n) => next.add(n.id));
      return next;
    });
  }, [allNotifications]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleNavigate = useCallback(
    (link: string | undefined) => {
      if (link) router.push(link);
    },
    [router],
  );

  /* ---- Derived ---- */

  const hasAnyUnread = unreadCount > 0;

  /* ---- Render ---- */

  return (
    <div className="space-y-8 pb-12" role="main" aria-label="Notification Center">
      {/* ================================================================ */}
      {/*  HEADER — TextReveal-style entrance                              */}
      {/* ================================================================ */}

      <section aria-label="Page header">
        <motion.div
          variants={staggerContainer(STAGGER.page, 0)}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <motion.div variants={fadeLift} custom={prefersReduced}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-foreground tracking-tight leading-tight">
              Notification{' '}
              <span className="text-gradient-gold">Center</span>
            </h1>
          </motion.div>

          <motion.div
            variants={fadeLift}
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', 0.1)}
          >
            <p className="text-sm text-neutral-500 max-w-2xl">
              Stay informed about project milestones, approvals, and
              activity across all your projects.
            </p>
          </motion.div>

          {/* Live data status badge */}
          {isUsingFallback && !isLoading && (
            <motion.div
              variants={fadeLift}
              custom={prefersReduced}
              transition={makeTransition('entrance', 'micro', 0.15)}
            >
              <LiveDataUnavailableBadge />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/*  ACTIONS BAR — Filters + Mark All As Read                         */}
      {/* ================================================================ */}

      <section aria-label="Notification filters and actions">
        <motion.div
          variants={fadeLift}
          initial="hidden"
          animate="visible"
          custom={prefersReduced}
          transition={makeTransition('entrance', 'component', 0.15)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          {/* ---- Filter Tabs ---- */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-border/15"
            role="tablist"
            aria-label="Filter notifications by type"
          >
            {FILTER_OPTIONS.map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="notification-list-panel"
                  className={cn(
                    'relative px-3.5 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-300',
                    isActive
                      ? 'text-void'
                      : 'text-neutral-500 hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-filter-pill"
                      className="absolute inset-0 rounded-lg bg-accent"
                      transition={
                        prefersReduced
                          ? { duration: 0.01 }
                          : { type: 'spring', stiffness: 380, damping: 30 }
                      }
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    {tab.key === 'all' && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                          isActive
                            ? 'bg-void/20 text-void'
                            : 'bg-white/[0.06] text-neutral-500',
                        )}
                      >
                        {notificationsWithLocalRead.length}
                      </span>
                    )}
                    {tab.key === 'unread' && hasAnyUnread && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                          isActive
                            ? 'bg-void/20 text-void'
                            : 'bg-white/[0.06] text-neutral-500',
                        )}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---- Mark All As Read ---- */}
          {hasAnyUnread && (
            <motion.button
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={makeTransition('entrance', 'component')}
              onClick={handleMarkAllAsRead}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
                'bg-accent/10 text-accent border border-accent/20',
                'hover:bg-accent/20 hover:border-accent/30 transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              )}
              aria-label={`Mark all ${unreadCount} notifications as read`}
            >
              <Icon name="check" size={15} />
              <span>Mark All as Read</span>
            </motion.button>
          )}
        </motion.div>

        {/* ---- Live accessible count ---- */}
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {filteredNotifications.length} notification
          {filteredNotifications.length !== 1 ? 's' : ''} shown.
          {hasAnyUnread
            ? ` ${unreadCount} unread.`
            : ' All notifications read.'}
        </div>
      </section>

      {/* ================================================================ */}
      {/*  NOTIFICATION LIST                                                */}
      {/* ================================================================ */}

      <section aria-label="Notification list" id="notification-list-panel">
        {isLoading ? (
          <NotificationSkeleton count={6} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              <motion.div
                key={`list-${activeFilter}`}
                variants={staggerContainer(STAGGER.component, 0.05)}
                initial="hidden"
                animate="visible"
                exit={{
                  opacity: 0,
                  transition: {
                    duration: prefersReduced ? 0.01 : DURATION.micro,
                  },
                }}
                className="space-y-2"
                role="list"
                aria-label={`${activeFilter === 'all' ? 'All' : activeFilter === 'unread' ? 'Unread' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} notifications`}
              >
                {filteredNotifications.map((notification, idx) => {
                  const isExpanded = expandedId === notification.id;
                  return (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                      index={idx}
                      isExpanded={isExpanded}
                      prefersReduced={prefersReduced}
                      onMarkAsRead={handleMarkAsRead}
                      onToggleExpand={handleToggleExpand}
                      onNavigate={handleNavigate}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReduced ? 0.01 : DURATION.component }}
              >
                <EmptyNotificationState prefersReduced={prefersReduced} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notification List Item — Individual notification card                     */
/* -------------------------------------------------------------------------- */

function NotificationListItem({
  notification,
  index,
  isExpanded,
  prefersReduced,
  onMarkAsRead,
  onToggleExpand,
  onNavigate,
}: {
  notification: NotificationData;
  index: number;
  isExpanded: boolean;
  prefersReduced: boolean;
  onMarkAsRead: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onNavigate: (link: string | undefined) => void;
}) {
  const typeColor = TYPE_ICON_COLOR[notification.type];
  const dotColor = TYPE_DOT_COLOR[notification.type];
  const glowClass = TYPE_GLOW_CLASS[notification.type];

  const handleClick = useCallback(() => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onToggleExpand(notification.id);
  }, [notification.id, notification.isRead, onMarkAsRead, onToggleExpand]);

  return (
    <motion.div
      layout
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      exit={{
        opacity: 0,
        scale: 0.97,
        y: -8,
        transition: { duration: prefersReduced ? 0.01 : 0.2, ease: EASE.sharp },
      }}
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', index * 0.05)}
      role="listitem"
      className={cn(
        'group relative rounded-2xl border transition-all duration-300 cursor-pointer',
        'hover:bg-white/[0.03] hover:border-border/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isExpanded
          ? 'border-accent/25 bg-white/[0.03]'
          : 'border-border/20 bg-surface',
      )}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onClick={handleClick}
      aria-expanded={isExpanded}
      aria-label={`${notification.title}${notification.isRead ? '' : ', unread'}${notification.type === 'approval' ? ', requires approval' : ''}`}
    >
      {/* Subtle top specular highlight */}
      <div
        className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* ================================================================ */}
      {/*  Main row — visible even when collapsed                           */}
      {/* ================================================================ */}
      <div className="relative p-4 sm:p-5 flex items-start gap-4">
        {/* ---- Timeline-style connector dot ---- */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div
            className={cn(
              'w-[15px] h-[15px] rounded-full border-2 relative z-10 transition-colors duration-300',
              dotColor,
              notification.isRead && 'opacity-40',
            )}
            aria-hidden="true"
          />
          {/* Vertical line that connects to the next dot (CSS-based) —
              rendered below as a full-height pseudo connector via the grid */}
        </div>

        {/* ---- Icon indicator ---- */}
        <div
          className={cn(
            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300',
            isExpanded
              ? 'bg-accent/[0.08] border-accent/20'
              : 'bg-white/[0.03] border-border/15 group-hover:bg-white/[0.05]',
          )}
          aria-hidden="true"
        >
          <Icon
            name={TYPE_ICON_MAP[notification.type]}
            size={18}
            className={cn(
              'transition-colors duration-300',
              typeColor,
              notification.isRead && 'opacity-60',
            )}
          />
        </div>

        {/* ---- Content ---- */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                {/* Title */}
                <h3
                  className={cn(
                    'text-sm leading-snug transition-colors duration-300',
                    notification.isRead
                      ? 'text-neutral-400 font-medium'
                      : 'text-foreground font-semibold',
                  )}
                >
                  {notification.title}
                </h3>

                {/* Type badge */}
                <span
                  className={cn(
                    'shrink-0 text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded',
                    typeColor,
                    'bg-white/[0.03] border border-border/10',
                  )}
                >
                  {notification.type}
                </span>
              </div>

              {/* Message preview */}
              <p
                className={cn(
                  'text-xs mt-1 leading-relaxed line-clamp-1 transition-colors duration-300',
                  notification.isRead ? 'text-neutral-600' : 'text-neutral-500',
                )}
              >
                {notification.message}
              </p>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 mt-2">
                <Icon
                  name="clock"
                  size={11}
                  className={cn(
                    'transition-colors duration-300',
                    notification.isRead ? 'text-neutral-700' : 'text-neutral-600',
                  )}
                />
                <span className="text-[10px] font-mono text-neutral-600">
                  {formatRelativeTime(notification.timestamp)}
                </span>
              </div>
            </div>

            {/* ---- Unread indicator (gold dot) ---- */}
            <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
              {!notification.isRead && (
                <span
                  className="relative flex h-2.5 w-2.5"
                  aria-label="Unread notification"
                  role="status"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
              )}

              {/* Expand/collapse chevron */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={
                  prefersReduced
                    ? { duration: 0.01 }
                    : { duration: DURATION.micro, ease: EASE.transition }
                }
                className={cn(
                  'transition-opacity duration-300',
                  isExpanded ? 'text-accent' : 'text-neutral-600 opacity-0 group-hover:opacity-100',
                )}
              >
                <Icon name="chevron-right" size={14} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Expanded detail panel — slides open inline                       */}
      {/* ================================================================ */}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              prefersReduced
                ? { duration: 0.01 }
                : { duration: DURATION.component, ease: EASE.entrance }
            }
            className="overflow-hidden"
          >
            <div
              className={cn(
                'px-4 sm:px-5 pb-5 pt-1 border-t border-border/15',
                glowClass,
              )}
            >
              <div className="pl-[68px] space-y-4">
                {/* Full message */}
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {notification.message}
                </p>

                {/* Detail metadata */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-neutral-600">
                  <span>
                    Type:{' '}
                    <span className={cn('font-semibold', typeColor)}>
                      {notification.type.charAt(0).toUpperCase() +
                        notification.type.slice(1)}
                    </span>
                  </span>
                  <span className="text-border/30" aria-hidden="true">
                    |
                  </span>
                  <span>
                    ID:{' '}
                    <span className="text-neutral-500">
                      {notification.id}
                    </span>
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-1">
                  {notification.link && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(notification.link);
                      }}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold',
                        'bg-accent text-void hover:bg-accent-bright',
                        'transition-colors duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      )}
                      aria-label={`Navigate to ${notification.link}`}
                    >
                      <Icon name="external-link" size={13} />
                      <span>View Details</span>
                    </button>
                  )}

                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold',
                        'text-neutral-500 hover:text-foreground',
                        'bg-white/[0.03] hover:bg-white/[0.06] border border-border/15 hover:border-border/30',
                        'transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      )}
                      aria-label="Mark as read"
                    >
                      <Icon name="check" size={12} />
                      <span>Mark as Read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
