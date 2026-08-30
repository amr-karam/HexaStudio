'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { ChapterHeading } from '@/components/scroll/ChapterHeading';
import { useAchievements } from '@/features/achievements/hooks/useAchievements';
import type { Achievement } from '@/features/achievements/types';
import { parseStatValue } from '@/features/portfolio/lib/parse-stat-value';
import { useReducedMotion } from '@/hooks';
import { DUR, EASING, STAGGER_TOKENS } from '@/lib/motion/tokens';

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
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }}
      viewport={{ once: true }}
    >
      <span className="font-mono tabular-nums text-4xl md:text-6xl font-light text-sl-gold-hover transition-colors duration-300 group-hover:text-sl-alabaster">
        {display}
        {suffix}
      </span>
      <div className="h-[3px] w-0 group-hover:w-full bg-gradient-to-r from-gold/50 via-gold/80 to-gold/50 transition-all duration-1000" />
    </motion.div>
  );
};

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
  const transitionProps = reducedMotion
    ? { duration: DUR.micro }
    : {
        duration: DUR.scene,
        ease: EASING.easeOutExpo,
        delay: index * STAGGER_TOKENS.lines,
      };

  return (
    <li className="relative overflow-hidden border-t border-sl-silver/20 last:border-b group">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sl-gold-subtle/30 group-hover:border-sl-gold-subtle/60 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sl-gold-subtle/30 group-hover:border-sl-gold-subtle/60 transition-colors duration-500" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={isInView ? { y: '0%', opacity: 1, scale: 1 } : undefined}
        transition={transitionProps}
        className="group grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3rem_1.2fr_1fr_auto] items-baseline gap-6 py-6 md:py-8 px-4 transition-all duration-300 hover:bg-sl-gold-subtle/5 hover:px-6 md:hover:px-10 hover:border-sl-gold-subtle/10"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-sl-mist/60 transition-colors duration-300 group-hover:text-obsidian/60">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex-1">
          <span className="font-serif text-2xl md:text-4xl font-light text-sl-alabaster transition-colors duration-300 group-hover:text-sl-gold-hover/90">
            {achievement.title}
          </span>
          {achievement.description ? (
            <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.25em] text-sl-mist/60 transition-colors duration-300 group-hover:text-obsidian/70">
              {achievement.description}
            </span>
          ) : (
            <span className="hidden md:block" aria-hidden="true" />
          )}
        </div>

        <StatValue value={achievement.value} isInView={isInView} />
      </motion.div>

      {/* Bottom animated accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-sl-gold-subtle/60 group-hover:w-full transition-all duration-1000 ease-out" />
    </li>
  );
};

export const AchievementsSection = () => {
  const { data } = useAchievements();
  const achievements = data?.data ?? [];
  const listRef = useRef<HTMLUListElement>(null);
  const isInView = useInView(listRef, { once: true, margin: '-100px' });
  const displayAchievements = achievements.length > 0 ? achievements : fallbackAchievements;

  return (
    <section className="relative px-8 md:px-16 py-32 bg-void-deep overflow-hidden">
      {/* Layered ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sl-gold-subtle/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sl-gold-subtle/[0.015] rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle animated pattern */}
      <div className="absolute inset-0 -z-10" 
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <ChapterHeading
          index={3}
          chapter="Method"
          kicker="Awards & Milestones"
          title="Proof in Numbers"
          accentWords={['Numbers']}
          className="mb-16 md:mb-24"
        />

        <div className="relative">
          <ul ref={listRef} className="w-full space-y-0">
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
      </div>
    </section>
  );
};