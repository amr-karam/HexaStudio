'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patch } from '@/lib/api';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  DollarSign,
  Flag,
  UserPlus,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  useNotifications,
  useMarkAllRead,
  useUnreadCount,
} from '@/lib/hooks';
import { cn } from '@/components/ui/cn';
import type { Notification } from '@hexa-hub/types';

// ─── Constants ──────────────────────────────────────────────────────────

const MAX_VISIBLE = 8;

const typeConfig: Record<
  string,
  { icon: React.ElementType; bg: string; text: string; dotColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
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
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dotColor: 'bg-red-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
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
    text: 'text-neutral-400',
    dotColor: 'bg-neutral-400',
  },
  invoice: {
    icon: DollarSign,
    bg: 'bg-[#D4A843]/10',
    text: 'text-[#D4A843]',
    dotColor: 'bg-[#D4A843]',
  },
  milestone: {
    icon: Flag,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  invite: {
    icon: UserPlus,
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    dotColor: 'bg-cyan-400',
  },
};

const defaultTypeConfig = {
  icon: Bell,
  bg: 'bg-neutral-500/10',
  text: 'text-neutral-400',
  dotColor: 'bg-neutral-400',
};

// ─── Helpers ────────────────────────────────────────────────────────────

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ─── Notification Item ──────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkRead, onClose }: NotificationItemProps) {
  const cfg = notification.channel
    ? typeConfig[notification.channel] ?? defaultTypeConfig
    : defaultTypeConfig;
  const Icon = cfg.icon;
  const isUnread = !notification.read;

  const handleClick = () => {
    if (isUnread && notification.id) {
      onMarkRead(notification.id);
    }
    onClose();
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors duration-200 border-b border-[#1F1F1F]/30 last:border-0',
        isUnread && 'bg-[#D4A843]/[0.03]',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          cfg.bg,
        )}
      >
        <Icon size={14} className={cfg.text} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-[13px] leading-tight line-clamp-2',
            isUnread ? 'text-white font-medium' : 'text-neutral-300 font-light',
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1 font-light">
            {notification.body}
          </p>
        )}
        <span className="text-[10px] text-neutral-600 mt-1.5 block font-light">
          {notification.createdAt ? formatTimestamp(notification.createdAt) : ''}
        </span>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0 mt-1.5" />
      )}
    </motion.button>
  );
}

// ─── Notification Center ────────────────────────────────────────────────

export function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: notifications, isLoading, isError } = useNotifications({
    limit: MAX_VISIBLE,
  } as Record<string, unknown>);

  const { count: unreadCount } = useUnreadCount();
  const markAllRead = useMarkAllRead();
  const queryClient = useQueryClient();

  // Mutation for marking a single notification as read
  const markOneReadMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => patch<void>(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close panel on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    markAllRead.mutate(undefined);
  }, [markAllRead]);

  const handleMarkOneRead = useCallback(
    (id: string) => {
      markOneReadMutation.mutate(id);
    },
    [markOneReadMutation],
  );

  const handleViewAll = useCallback(() => {
    setIsOpen(false);
    router.push('/dashboard/notifications');
  }, [router]);

  const resolvedNotifications = (notifications ?? []).slice(0, MAX_VISIBLE);
  const hasUnread = unreadCount > 0;
  const badgeCount = hasUnread ? (unreadCount > 99 ? '99+' : String(unreadCount)) : null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        ref={buttonRef}
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative p-2 rounded-lg transition-colors duration-300',
          isOpen
            ? 'bg-white/[0.06] text-white'
            : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]',
        )}
        aria-label={`Notifications${hasUnread ? ` — ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={18} />

        {/* Unread badge */}
        <AnimatePresence>
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center',
                'bg-red-500 text-white text-[9px] font-bold leading-none',
                badgeCount && badgeCount.length > 2
                  ? 'min-w-[18px] h-[18px] rounded-full px-1'
                  : 'min-w-[16px] h-[16px] rounded-full',
              )}
            >
              {badgeCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{
              duration: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-48px)] bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F]/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-serif text-white font-light tracking-wide">
                  Notifications
                </h3>
                {hasUnread && (
                  <span className="px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] text-[10px] font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {hasUnread && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllRead}
                    disabled={markAllRead.isLoading}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-[#D4A843] hover:bg-white/[0.04] transition-colors duration-200 disabled:opacity-40"
                    aria-label="Mark all as read"
                    title="Mark all as read"
                  >
                    {markAllRead.isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
                    ) : (
                      <CheckCheck size={14} />
                    )}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.04] transition-colors duration-200"
                  aria-label="Close notifications"
                >
                  <X size={14} />
                </motion.button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto">
              {isLoading ? (
                /* Loading state */
                <div className="py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-neutral-800 rounded w-3/4" />
                        <div className="h-2.5 bg-neutral-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                /* Error state */
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertCircle size={24} className="text-red-400/60 mb-3" />
                  <p className="text-sm text-red-400 font-light">Failed to load notifications</p>
                  <p className="text-[11px] text-neutral-600 mt-1 font-light">
                    Please check your connection and try again
                  </p>
                </div>
              ) : resolvedNotifications.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center mb-3">
                    <Bell size={20} className="text-neutral-600" />
                  </div>
                  <p className="text-sm text-neutral-500 font-light">All caught up</p>
                  <p className="text-[11px] text-neutral-600 mt-1 font-light">
                    No new notifications
                  </p>
                </div>
              ) : (
                /* Notification items */
                <AnimatePresence mode="wait">
                  {resolvedNotifications.map((notif, i) => (
                    <NotificationItem
                      key={notif.id ?? i}
                      notification={notif}
                      onMarkRead={handleMarkOneRead}
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#1F1F1F]/50">
              <button
                onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[12px] text-neutral-400 hover:text-[#D4A843] hover:bg-white/[0.02] transition-colors duration-200 font-light"
              >
                View all notifications
                <ChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
