'use client';

/**
 * HEXA Portal — Activity Feed Section
 *
 * Vertical timeline with connector line, animated entrance for each
 * activity item, and type-based dot coloring.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ActivityItem } from './ActivityItem';
import { staggerContainer, fadeLift, makeTransition } from '@/lib/motion';
import type { ActivityItemData } from '../types';

interface ActivityFeedSectionProps {
  activities: ActivityItemData[];
  prefersReduced: boolean;
}

export function ActivityFeedSection({ activities, prefersReduced }: ActivityFeedSectionProps) {
  const dotColorClass = (type: ActivityItemData['type']): string => {
    switch (type) {
      case 'upload': return 'bg-blue-500/20 border-blue-400';
      case 'approval': return 'bg-emerald-500/20 border-emerald-400';
      case 'milestone': return 'bg-sl-gold-hover/20 border-sl-gold-hover';
      case 'invoice': return 'bg-amber-500/20 border-amber-400';
      default: return 'bg-white/5 border-sl-silver';
    }
  };

  return (
    <motion.section
      className={cn(
        'rounded-2xl border border-sl-silver/20 bg-sl-obsidian/70 p-6',
      )}
      aria-label="Recent project activity"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0, 0)}
    >
      <h2 className="text-base font-bold text-sl-alabaster mb-5">
        Live Project Activity
      </h2>

      <motion.ol
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="visible"
        className="relative"
        role="list"
        aria-label="Activity timeline"
      >
        {/* Vertical timeline connector line */}
        {activities.length > 1 && (
          <div
            className="absolute left-[7px] top-3 bottom-3 w-px bg-sl-silver/30"
            aria-hidden="true"
          />
        )}

        {activities.map((item, idx) => (
          <motion.li
            key={item.id}
            variants={fadeLift}
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', idx * 0.08)}
            className="relative flex gap-3 py-3 first:pt-0 last:pb-0"
            role="listitem"
          >
            {/* Timeline dot */}
            <div
              className={cn(
                'relative z-10 mt-1.5 w-[15px] h-[15px] rounded-full border-2 shrink-0',
                dotColorClass(item.type),
              )}
              aria-hidden="true"
            />

            {/* Activity item */}
            <div className="flex-1 min-w-0 -mt-0.5">
              <ActivityItem item={item} />
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </motion.section>
  );
}
