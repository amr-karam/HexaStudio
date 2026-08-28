'use client';

/**
 * HEXA Portal — Meeting Card
 *
 * Calendar-style card with date badge, time, and participants.
 * Uses motion entrance choreography with `prefers-reduced-motion` gating.
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
        'flex gap-4 p-4 rounded-xl border',
        'bg-sl-stone/10 border-sl-silver/20',
        'hover:border-sl-gold-hover/30 transition-colors duration-300',
      )}
    >
      {/* Date Badge */}
      <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-sl-gold-subtle/10 border border-sl-gold-hover/15">
        <span className="text-[10px] uppercase tracking-widest font-mono text-sl-gold-hover">
          {monthShort}
        </span>
        <span className="text-xl font-serif font-light text-sl-alabaster leading-none">
          {dayNum}
        </span>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-sl-alabaster leading-snug">
          {meeting.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-1">
          <Icon name="clock" size={11} className="text-sl-silver" />
          <span className="text-[11px] font-mono text-sl-gold-hover">
            {meeting.time}
          </span>
        </div>
        <p className="text-[11px] text-sl-silver mt-1.5 truncate">
          {meeting.participants.join(' · ')}
        </p>
      </div>
    </motion.div>
  );
}
