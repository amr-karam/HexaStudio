'use client';

import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface TimelineMilestone {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO date
  endDate?: string; // ISO date (optional; if absent, single-date milestone)
  status: 'completed' | 'in-progress' | 'pending';
}

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  projectStartDate?: string;
  projectEndDate?: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Status config                                                             */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  completed: {
    bar: 'bg-accent shadow-[0_0_12px_rgba(212,175,55,0.25)]',
    dot: 'bg-accent border-accent',
    label: 'text-accent',
    badge: 'bg-accent/10 text-accent border-accent/30',
  },
  'in-progress': {
    bar: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    dot: 'bg-amber-500 border-amber-500',
    label: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  pending: {
    bar: 'bg-neutral-700',
    dot: 'bg-neutral-700 border-neutral-600',
    label: 'text-neutral-500',
    badge: 'bg-neutral-800/50 text-neutral-500 border-neutral-700',
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Helper: compute bar position & width (RTL-aware)                          */
/* -------------------------------------------------------------------------- */

interface BarStyle {
  left: string;
  right: string;
  width: string;
}

function computeBarStyle(
  startDate: string,
  endDate: string | undefined,
  rangeStart: number,
  rangeEnd: number,
  isRTL: boolean,
): BarStyle {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : start;
  const totalDuration = rangeEnd - rangeStart;

  if (totalDuration <= 0) return { left: '0%', right: '0%', width: '0%' };

  const fraction = Math.max(0, ((start - rangeStart) / totalDuration) * 100);
  const width = Math.max(2, ((end - start) / totalDuration) * 100);

  if (isRTL) {
    // In RTL, the bar starts from the right edge
    const right = fraction;
    return { left: 'auto', right: `${right}%`, width: `${width}%` };
  }

  return {
    left: `${fraction}%`,
    right: 'auto',
    width: `${width}%`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Date formatting helper                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string, locale: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale || 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function TimelineView({
  milestones,
  projectStartDate,
  projectEndDate,
  className = '',
}: TimelineViewProps) {
  const { t, locale, dir } = useLocale();
  const prefersReduced = useReducedMotion();
  const isRTL = dir === 'rtl';

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Determine the date range for the Gantt
  const { rangeStart, rangeEnd, dayWidth } = useMemo(() => {
    const dates = milestones.flatMap((m) => {
      const d = [new Date(m.startDate).getTime()];
      if (m.endDate) d.push(new Date(m.endDate).getTime());
      return d;
    });

    if (projectStartDate) dates.push(new Date(projectStartDate).getTime());
    if (projectEndDate) dates.push(new Date(projectEndDate).getTime());

    if (dates.length === 0) {
      const now = Date.now();
      const week = 7 * 24 * 60 * 60 * 1000;
      return { rangeStart: now - week, rangeEnd: now + week * 3, dayWidth: 120 };
    }

    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const padding = (max - min) * 0.15 || 7 * 24 * 60 * 60 * 1000; // 15% padding or 1 week

    const rs = min - padding;
    const re = max + padding;
    const totalDays = (re - rs) / (1000 * 60 * 60 * 24);
    const dw = totalDays > 60 ? 80 : totalDays > 30 ? 100 : 140;

    return { rangeStart: rs, rangeEnd: re, dayWidth: dw };
  }, [milestones, projectStartDate, projectEndDate]);

  const totalDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
  const totalWidth = Math.max(totalDays * dayWidth, 600);

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers: Array<{ label: string; position: number }> = [];
    const startDate = new Date(rangeStart);
    const endDate = new Date(rangeEnd);

    // Go to the first day of the month
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (cursor <= endDate) {
      const position = ((cursor.getTime() - rangeStart) / (rangeEnd - rangeStart)) * 100;
      if (position >= 0 && position <= 100) {
        markers.push({
          label: cursor.toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale || 'en-US', {
            month: 'short',
            year: '2-digit',
          }),
          position,
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return markers;
  }, [rangeStart, rangeEnd, locale]);

  if (milestones.length === 0) {
    return (
      <div className={`bg-surface border border-border/50 p-8 md:p-12 rounded-sm ${className}`}>
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-neutral-800/50 border border-border/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-sm font-light">{t('portal.timeline.noMilestones')}</p>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`bg-surface border border-border/50 rounded-sm overflow-hidden ${className}`}
      aria-label={t('portal.timeline.title')}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent/60" />
          <h2 className="text-base font-medium text-foreground tracking-wide">
            {t('portal.timeline.title')}
          </h2>
        </div>
        {/* Status legend */}
        <div className="hidden sm:flex items-center gap-4">
          {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
              <span className={`text-[10px] uppercase tracking-wider font-mono ${STATUS_CONFIG[status].label}`}>
                {t(`portal.timeline.${status === 'in-progress' ? 'inProgress' : status}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable timeline area */}
      <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div className="relative" style={{ minWidth: `${totalWidth}px` }}>
          {/* Month grid lines */}
          <div className="relative h-10 border-b border-border/20" dir={isRTL ? 'rtl' : 'ltr'}>
            {monthMarkers.map((marker, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 flex items-end pb-2"
                style={{ [isRTL ? 'right' : 'left']: `${marker.position}%` }}
              >
                <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider whitespace-nowrap">
                  {marker.label}
                </span>
                <div
                  className="absolute inset-y-0 w-px bg-border/10"
                  style={{ [isRTL ? 'right' : 'left']: 0 }}
                />
              </div>
            ))}
          </div>

          {/* Milestone rows */}
          <div className="divide-y divide-border/10">
            {milestones.map((milestone, index) => {
              const config = STATUS_CONFIG[milestone.status];
              const barStyle = computeBarStyle(milestone.startDate, milestone.endDate, rangeStart, rangeEnd, isRTL);
              const isSingleDay = !milestone.endDate || milestone.startDate === milestone.endDate;

              return (
                <motion.div
                  key={milestone.id}
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={
                    isInView
                      ? { opacity: 1, y: 0 }
                      : prefersReduced
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 12 }
                  }
                  transition={{
                    delay: index * 0.06,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative flex items-center h-14 px-4 hover:bg-white/[0.02] transition-colors duration-300 group"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {/* Milestone info (name + dates) - fixed on left (LTR) or right (RTL) */}
                  <div className={cn(
                    'flex items-center gap-3 min-w-[220px] shrink-0 z-10',
                    isRTL ? 'order-last text-right' : 'order-first',
                  )}>
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full border-2 shrink-0',
                      config.dot,
                      'transition-transform duration-300 group-hover:scale-125',
                    )} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {milestone.name}
                      </span>
                      <span className="text-[10px] text-neutral-600 font-mono">
                        {formatDate(milestone.startDate, locale)}
                        {milestone.endDate && milestone.endDate !== milestone.startDate
                          ? ` — ${formatDate(milestone.endDate, locale)}`
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Gantt bar area */}
                  <div className="relative flex-1 h-full mx-4">
                    {/* Grid background */}
                    <div className="absolute inset-0">
                      {monthMarkers.map((marker, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 w-px bg-border/5"
                          style={{ [isRTL ? 'right' : 'left']: `${marker.position}%` }}
                        />
                      ))}
                    </div>

                    {/* The bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-7"
                      style={{
                        left: barStyle.left,
                        right: barStyle.right,
                        width: barStyle.width,
                      }}
                    >
                      <motion.div
                        initial={prefersReduced ? { scaleX: 1 } : { scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : { scaleX: prefersReduced ? 1 : 0 }}
                        transition={{
                          delay: index * 0.06 + 0.2,
                          duration: 0.6,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{ originX: isRTL ? 1 : 0 }}
                        className={`h-full rounded-full ${config.bar} flex items-center px-3`}
                      >
                        {!isSingleDay && (
                          <span className="text-[8px] font-mono text-black/60 uppercase tracking-wider truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {milestone.status === 'completed' ? '✓' : milestone.status === 'in-progress' ? '●' : '○'}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Status badge (right side in LTR, left side in RTL) */}
                  <div className={cn(
                    'shrink-0 w-24',
                    isRTL ? 'order-first text-left' : 'text-right',
                  )}>
                    <span className={`inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full font-mono ${config.badge}`}>
                      {t(`portal.timeline.${milestone.status === 'in-progress' ? 'inProgress' : milestone.status}`)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helper text for scroll */}
      <div className="px-6 py-3 border-t border-border/10">
        <p className="text-[9px] uppercase tracking-widest text-neutral-600 font-mono text-center sm:hidden">
          ← Scroll horizontally →
        </p>
      </div>
    </section>
  );
}
