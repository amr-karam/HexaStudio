'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChapterMarker } from '@/components/animation/ChapterMarker';
import { KineticTitle } from '@/components/scroll/KineticTitle';
import { DUR, EASING, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface ChapterHeadingProps {
  /** 1-based chapter number (rendered as a roman numeral). */
  index: number;
  /** Chapter name for the marker — e.g. "Craft". */
  chapter: string;
  /** Mono kicker above the title — e.g. "Our Process". */
  kicker?: string;
  /** Heading text (scrub-assembled char by char). */
  title: string;
  /** Words inside `title` rendered italic gold. */
  accentWords?: string[];
  /** Supporting line under the title. */
  description?: string;
  className?: string;
}

/**
 * ChapterHeading — the standard chapter intro molecule for the homepage
 * scroll film: `(CH. II) — CRAFT` marker, a gold hairline that draws with
 * scroll, a kinetic scrub-assembled title, and a mono kicker / description
 * fading in with the `lines` token stagger.
 *
 * Reduced motion collapses every layer to instant, opacity-only states
 * (handled inside ChapterMarker / KineticTitle and via `staticMode` here).
 */
export const ChapterHeading = ({
  index,
  chapter,
  kicker,
  title,
  accentWords = [],
  description,
  className,
}: ChapterHeadingProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { staticMode } = useMotionPolicy();

  // Hairline draws as the heading travels through the upper viewport.
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 95%', 'start 55%'],
  });
  const hairlineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <ChapterMarker index={index} title={chapter} className="mb-6" />

      {/* Gold hairline — scroll-drawn chapter underline */}
      <motion.span
        aria-hidden="true"
        style={staticMode ? { scaleX: 1 } : { scaleX: hairlineScale }}
        transition={{ duration: DUR.scene, ease: EASING.easeOutExpo }}
        className="mb-8 block h-px w-24 origin-left bg-accent/50"
      />

      {kicker && (
        <motion.span
          initial={staticMode ? false : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.ui, ease: EASING.easeOutExpo }}
          className="mb-6 block font-mono text-xs uppercase tracking-[0.5em] text-neutral-500"
        >
          {kicker}
        </motion.span>
      )}

      <KineticTitle
        text={title}
        accentWords={accentWords}
        className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-[1.1]"
      />

      {description && (
        <motion.p
          initial={staticMode ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: DUR.scene,
            ease: EASING.easeOutExpo,
            delay: STAGGER_TOKENS.lines,
          }}
          className="mt-6 w-full max-w-lg text-base font-light leading-relaxed text-neutral-500"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};
