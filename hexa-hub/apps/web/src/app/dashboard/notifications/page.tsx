'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications, useMarkAllRead, useMarkNotificationRead, useDeleteNotification, useUnreadCount } from '@/lib/hooks';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

const typeStyles: Record<string, string> = {
  success: 'text-emerald-400 bg-emerald-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  error: 'text-red-400 bg-red-500/10',
  info: 'text-blue-400 bg-blue-500/10',
};

const typeIcons: Record<string, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info,
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data: notifications, isLoading, refetch } = useNotifications(
    filter === 'unread' ? ({ unread: 'true' as unknown } as Record<string, unknown>) : undefined,
  );
  const { count: unreadCount } = useUnreadCount();
  const markAllRead = useMarkAllRead();

  const handleMarkAllRead = async () => {
    markAllRead.mutate(undefined);
    refetch();
  };

  return (
    <div className="p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-serif font-light">
            <span className="text-gold">Notifications</span>
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-all"
            >
              <CheckCheck size={14} />
              Mark All Read
            </button>
          )}
        </div>
        <p className="text-neutral-500 font-light">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
            : 'You are all caught up.'}
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px bg-gradient-to-r from-gold/60 via-gold/20 to-transparent"
        />
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
            filter === 'all'
              ? 'bg-gold/10 text-gold border border-gold/30'
              : 'text-neutral-500 border border-transparent hover:text-neutral-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
            filter === 'unread'
              ? 'bg-gold/10 text-gold border border-gold/30'
              : 'text-neutral-500 border border-transparent hover:text-neutral-300'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-neutral-800 rounded-lg" />
              ))}
            </div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-border/30">
            {notifications.map((notif, i) => {
              const Icon = typeIcons[notif.channel ?? 'info'] || Info;
              return (
                <motion.div
                  key={notif.id ?? i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${
                    !notif.read ? 'border-l-2 border-l-gold' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      typeStyles[notif.channel ?? 'info'] || 'text-neutral-500 bg-neutral-800'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-light">{notif.title}</p>
                    {notif.body && (
                      <p className="text-xs text-neutral-600 mt-0.5">{notif.body}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-600 whitespace-nowrap mt-1">
                    {notif.createdAt
                      ? new Date(notif.createdAt).toLocaleDateString()
                      : '—'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell size={32} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-600 text-sm font-light">
              {filter === 'unread'
                ? 'No unread notifications.'
                : 'No notifications yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}