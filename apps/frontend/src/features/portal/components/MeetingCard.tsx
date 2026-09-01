'use client';

/**
 * HEXA Portal — Meeting Card Component
 *
 * Displays an upcoming meeting with a calendar-style date badge, title, time,
 * and participant list. Crafted with artisan-glass styling, gold accent borders
 * on hover, and staggered entrance animation respecting reduced motion.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';
import { fadeLift, makeTransition } from '@/lib/motion';
import type { UpcomingMeeting } from '../types';

interface MeetingCardProps {
  meeting: UpcomingMeeting;
  index: number;
  prefersReduced: boolean;
}

export function MeetingCard({ meeting, index, prefersReduced }: MeetingCardProps) {
  // Parse date string (e.g., "July 28, 2026")
  const parsed = new Date(meeting.date);
  const dayNum = isNaN(parsed.getDate()) ? '--' : parsed.getDate();
  const monthShort = isNaN(parsed.getMonth())
    ? '---'
    : parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  return (
    <motion.div
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', index * 0.08)}
      className={cn(
        'flex gap-4 p-4 rounded-2xl',
        'bg-sl-obsidian border border-sl-gold-subtle/15',
        'hover:border-sl-gold-subtle/40 hover:shadow-lg hover:shadow-sl-gold-subtle/10',
        'transition-all duration-300',
      )}
      role="listitem"
      aria-label={`Meeting: ${meeting.title} on ${meeting.date} at ${meeting.time}`}
    >
      {/* Date Badge — Calendar-style with gold accent */}
      <div
        className={cn(
          'flex flex-col items-center justify-center shrink-0',
          'w-14 h-14 rounded-lg',
          'bg-sl-gold-subtle/[0.06] border border-sl-gold-subtle/15',
        )}
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-widest font-mono text-sl-gold-hover">
          {monthShort}
        </span>
        <span className="text-xl font-serif font-light text-sl-alabaster leading-none">
          {dayNum}
        </span>
      </div>

      {/* Meeting Details */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <h4 className="text-sm font-semibold text-sl-alabaster leading-snug truncate">
          {meeting.title}
        </h4>

        {/* Time with clock icon */}
        <div className="flex items-center gap-1.5 mt-1">
          <Icon name="clock" size={11} className="text-sl-gold-hover" aria-hidden="true" />
          <span className="text-[11px] font-mono text-sl-gold-hover">
            {meeting.time}
          </span>
        </div>

        {/* Participants — truncated with ellipsis */}
        {meeting.participants.length > 0 && (
          <p className="text-[11px] text-sl-mist/60 mt-1.5 truncate" title={meeting.participants.join(', ')}>
            {meeting.participants.join(' · ')}
          </p>
        )}

        {/* Optional meeting link indicator */}
        {meeting.link && (
          <a
            href={meeting.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono uppercase tracking-wider text-sl-gold-hover/80 hover:text-sl-gold-hover transition-colors duration-200"
            aria-label={`Join meeting: ${meeting.title}`}
          >
            <Icon name="external-link" size={10} aria-hidden="true" />
            <span>Join</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}