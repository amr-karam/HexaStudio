'use client';

/**
 * HEXA Portal — Activity Feed Item
 *
 * Displays a single activity with icon, title, description, timestamp,
 * project tag, and subtle left border accent based on activity type.
 */

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './PortalIcons';
import type { ActivityItemData, ActivityType } from '../types';

interface ActivityItemProps {
  item: ActivityItemData;
  className?: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: IconName; color: string; borderColor: string }> = {
  approval: { icon: 'check', color: 'text-emerald-500', borderColor: 'border-l-emerald-500' },
  upload: { icon: 'upload', color: 'text-blue-500', borderColor: 'border-l-blue-500' },
  comment: { icon: 'message-square', color: 'text-purple-500', borderColor: 'border-l-purple-500' },
  milestone: { icon: 'zap', color: 'text-sl-gold-hover', borderColor: 'border-l-accent' },
  invoice: { icon: 'receipt', color: 'text-amber-400', borderColor: 'border-l-amber-400' },
  message: { icon: 'send', color: 'text-cyan-400', borderColor: 'border-l-cyan-400' },
  update: { icon: 'file-text', color: 'text-sl-mist/60', borderColor: 'border-l-neutral-500' },
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

export function ActivityItem({ item, className }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[item.type];

  return (
    <button
      type="button"
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-l-2 w-full text-left',
        'hover:bg-white/[0.04] transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        config.borderColor,
        className,
      )}
    >
      {/* Icon */}
      <div className={cn('mt-0.5 shrink-0', config.color)}>
        <Icon name={config.icon} size={14} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-sl-alabaster leading-snug">{item.title}</p>
        <p className="text-xs text-sl-mist/60 mt-0.5 line-clamp-2">{item.description}</p>

        <div className="flex items-center gap-2 mt-2">
          {item.projectName && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-sl-mist/60 bg-white/[0.03] px-2 py-0.5 rounded">
              {item.projectName}
            </span>
          )}
          <span className="text-[10px] text-sl-mist/60 font-mono">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>
      </div>
    </button>
  );
}
