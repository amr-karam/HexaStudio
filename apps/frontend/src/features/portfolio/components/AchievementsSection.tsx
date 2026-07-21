'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { makeTransition } from '@/lib/motion';
import { useAchievements } from '@/features/achievements/hooks/useAchievements';
import type { Achievement } from '@/features/achievements/types';

/**
 * Parse a value string like "12+", "200+", "8", "100%"
 * into a numeric part and a suffix string.
 */
function parseAchievementValue(raw: string): { numeric: number; suffix: string } {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { numeric: 0, suffix: raw };
  return { numeric: parseInt(match[1], 10), suffix: match[2] };
}

const StatItem = ({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) => {
  const { numeric, suffix } = parseAchievementValue(achievement.value);
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(0, numeric, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => setDisplayValue(Math.round(value).toString()),
    });
    return () => controls.stop();
  }, [isInView, numeric]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={makeTransition('entrance', 'page', index * 0.1)}
      className="text-center group relative"
    >
      <GlassCard variant="elevated" className="p-10 flex flex-col items-center">
        <div className="absolute -inset-4 bg-accent/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
        <span className="text-5xl md:text-7xl font-serif text-accent font-light block mb-4 transition-all duration-500 group-hover:scale-110 group-hover:text-white relative z-10">
          {displayValue}
          {suffix}
        </span>
        <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 group-hover:text-neutral-300 transition-colors duration-500 block relative z-10">
          {achievement.title}
        </span>
        {achievement.description && (
          <span className="text-xs text-neutral-600 mt-2 block relative z-10">
            {achievement.description}
          </span>
        )}
      </GlassCard>
    </motion.div>
  );
};

export const AchievementsSection = () => {
  const { data, isLoading } = useAchievements();
  const achievements = data?.data ?? [];

  // Don't render anything while loading or if there are no achievements
  if (!isLoading && achievements.length === 0) {
    return null;
  }

  return (
    <section className="px-8 md:px-16 py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-accent/30 via-accent/50 to-transparent" />
      <div className="w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {achievements.map((achievement, idx) => (
            <StatItem key={achievement.id} achievement={achievement} index={idx} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent via-accent/50 to-transparent" />
    </section>
  );
};
