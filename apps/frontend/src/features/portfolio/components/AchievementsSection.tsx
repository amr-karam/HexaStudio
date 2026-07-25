'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { ChapterHeading } from '@/components/scroll/ChapterHeading';
import { useAchievements } from '@/features/achievements/hooks/useAchievements';
import type { Achievement } from '@/features/achievements/types';
import { parseStatValue } from '@/features/portfolio/lib/parse-stat-value';
import { useReducedMotion } from '@/hooks';
import { DUR, EASING, STAGGER_TOKENS } from '@/lib/motion/tokens';

/**
 * StatValue — burocratik-style restrained counter: the numeric part counts
 * 0 → final with a pure easeOutExpo (no bounce), run ONCE when the wall
 * enters view, rendered in mono tabular numerals. Reduced motion jumps
 * straight to the final value.
 */
const StatValue = ({ value, isInView }: { value: string; isInView: boolean }) => {
  const { numeric, suffix } = parseStatValue(value);
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(String(numeric));
      return;
    }
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(0, numeric, {
      duration: DUR.scene,
      ease: EASING.easeOutExpo,
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [isInView, numeric, reducedMotion]);

  return (
    <span className="font-mono tabular-nums text-3xl md:text-5xl font-light text-accent transition-colors duration-200 group-hover:text-obsidian">
      {display}
      {suffix}
    </span>
  );
};

/**
 * AwardsRow — one line of the recognition wall: index / award / context /
 * count in a mono-aligned grid. Hover inverts the row to champagne gold with
 * obsidian type at micro duration; entry is a line-by-line mask reveal with
 * the `lines` token stagger.
 */
const AwardsRow = ({
  achievement,
  index,
  isInView,
}: {
  achievement: Achievement;
  index: number;
  isInView: boolean;
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <li className="overflow-hidden border-t border-border/20 last:border-b">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { y: '110%' }}
        animate={isInView ? { y: '0%', opacity: 1 } : undefined}
        transition={
          reducedMotion
            ? { duration: DUR.micro }
            : {
                duration: DUR.scene,
                ease: EASING.easeOutExpo,
                delay: index * STAGGER_TOKENS.lines,
              }
        }
        className="group grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3rem_1.2fr_1fr_auto] items-baseline gap-6 py-6 md:py-8 transition-all duration-200 hover:bg-accent hover:px-6 md:hover:px-10"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-neutral-600 transition-colors duration-200 group-hover:text-obsidian/60">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-serif text-2xl md:text-4xl font-light text-foreground transition-colors duration-200 group-hover:text-obsidian">
          {achievement.title}
        </span>
        {achievement.description ? (
          <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition-colors duration-200 group-hover:text-obsidian/70">
            {achievement.description}
          </span>
        ) : (
          <span className="hidden md:block" aria-hidden="true" />
        )}
        <StatValue value={achievement.value} isInView={isInView} />
      </motion.div>
    </li>
  );
};

/**
 * AchievementsSection — CH. IV — PROOF: a Noomo-style recognition wall.
 * Full-width rows with hover inversion, line-by-line mask-reveal entry, and
 * restrained run-once counters. Data flow unchanged (useAchievements, hides
 * when empty) — presentation layer only.
 */
const fallbackAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Projects Delivered',
    value: '150+',
    description: 'Global Architectural & Masterplan Deliveries',
    order: 1,
  },
  {
    id: 2,
    title: 'Awwwards & Honors',
    value: '18',
    description: 'International Digital & Design Accolades',
    order: 2,
  },
  {
    id: 3,
    title: 'Rendering Accuracy',
    value: '99.8%',
    description: 'Photorealistic Physical & Photometric Fidelity',
    order: 3,
  },
  {
    id: 4,
    title: 'Client Retention',
    value: '96%',
    description: 'Long-term Architectural & Developer Partnerships',
    order: 4,
  },
];

/**
 * AchievementsSection — CH. IV — PROOF: a Noomo-style recognition wall.
 * Full-width rows with hover inversion, line-by-line mask-reveal entry, and
 * restrained run-once counters. When CMS is empty, presents luxury fallback stats.
 */
export const AchievementsSection = () => {
  const { data } = useAchievements();
  const achievements = data?.data ?? [];
  const listRef = useRef<HTMLUListElement>(null);
  const isInView = useInView(listRef, { once: true, margin: '-100px' });
  const displayAchievements = achievements.length > 0 ? achievements : fallbackAchievements;

  return (
    <section className="px-8 md:px-16 py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <ChapterHeading
          index={3}
          chapter="Method"
          kicker="Awards & Milestones"
          title="Proof in Numbers"
          accentWords={['Numbers']}
          className="mb-16 md:mb-24"
        />

        <ul ref={listRef} className="w-full">
          {displayAchievements.map((achievement, idx) => (
            <AwardsRow
              key={achievement.id}
              achievement={achievement}
              index={idx}
              isInView={isInView}
            />
          ))}
        </ul>
      </div>
    </section>
  );
};
