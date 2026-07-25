'use client';

/**
 * HEXA Portal — Notification Item
 *
 * Displays a single notification with icon, title, message, timestamp,
 * and read/unread state. Click marks as read.
 */

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import type { NotificationData, NotificationType } from '../types';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

const NOTIFICATION_CONFIG: Record<NotificationType, { icon: IconName; color: string }> = {
  info: { icon: 'alert-circle', color: 'text-blue-400' },
  success: { icon: 'check', color: 'text-emerald-400' },
  warning: { icon: 'alert-circle', color: 'text-amber-400' },
  error: { icon: 'x', color: 'text-red-400' },
  approval: { icon: 'file-check', color: 'text-accent' },
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationItem({ notification, onMarkAsRead, className }: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type];

  return (
    <button
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead?.(notification.id);
        }
      }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg w-full text-left',
        'hover:bg-white/[0.02] transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        !notification.isRead && 'bg-accent/[0.02]',
        className,
      )}
      aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}`}
    >
      {/* Unread dot */}
      <div className="mt-1 shrink-0">
        {!notification.isRead ? (
          <div className="w-2 h-2 rounded-full bg-accent" />
        ) : (
          <div className="w-2 h-2" />
        )}
      </div>

      {/* Icon */}
      <div className={cn('mt-0.5 shrink-0', config.color)}>
        <Icon name={config.icon} size={14} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-sm leading-snug',
          notification.isRead ? 'text-neutral-400' : 'text-foreground',
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <span className="text-[10px] text-neutral-600 font-mono mt-1.5 block">
          {formatRelativeTime(notification.timestamp)}
        </span>
      </div>
    </button>
  );
}
