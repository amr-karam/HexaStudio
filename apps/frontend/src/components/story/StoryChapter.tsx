'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { ChapterHeading } from '@/components/scroll/ChapterHeading';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { motion } from 'framer-motion';

interface StoryChapterProps {
  index: number;
  chapter: string;
  kicker?: string;
  title: string;
  accentWords?: string[];
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'void' | 'obsidian' | 'void-alt';
  /** Show a peek of the next chapter at the bottom edge */
  showNextPeek?: boolean;
  /** Label for the next chapter peek */
  nextChapterLabel?: string;
  /** Section id for chapter rail / anchor navigation */
  id?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  void: 'bg-sl-void',
  obsidian: 'bg-sl-obsidian',
  'void-alt': 'bg-sl-void',
};

/**
 * StoryChapter — standard chapter wrapper for the cinematic scroll film.
 *
 * Composes:
 * - `ChapterHeading` for the kinetic title + marker + hairline
 * - `ScrollFadeIn` for content reveals
 * - Gold top/bottom hairlines for chapter separation
 * - Optional chapter transition curtain (scroll-triggered)
 * - Optional next-chapter preview at bottom edge
 */
export function StoryChapter({
  index,
  chapter,
  kicker,
  title,
  accentWords = [],
  description,
  children,
  className,
  variant = 'void',
  showNextPeek = false,
  nextChapterLabel,
  id,
}: StoryChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [curtainProgress, setCurtainProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === 'undefined') return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // Curtain sweeps from 0 → 1 as section top enters viewport center
        const start = viewportH * 0.85;
        const end = viewportH * 0.35;
        const raw = (start - rect.top) / (start - end);
        setCurtainProgress(Math.max(0, Math.min(1, raw)));
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={cn('relative cv-section', VARIANT_CLASSES[variant], className)}
    >
      {/* Chapter transition curtain — gold sweep on entry */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] z-50"
        style={{
          scaleX: curtainProgress,
          opacity: curtainProgress * 0.8,
          transformOrigin: 'left',
        }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-sl-gold-hover to-transparent" />
      </motion.div>

      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 md:px-16 md:py-32 lg:py-40">
        {/* Chapter heading */}
        <ChapterHeading
          index={index}
          chapter={chapter}
          kicker={kicker}
          title={title}
          accentWords={accentWords}
          description={description}
        />

        {/* Chapter content — scroll-triggered reveal */}
        <ScrollFadeIn delay={0.15}>
          <div className="mt-16 md:mt-24">
            {children}
          </div>
        </ScrollFadeIn>
      </div>

      {/* Bottom hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      {/* Next chapter peek — ghost label at bottom edge */}
      {showNextPeek && nextChapterLabel && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <ScrollFadeIn delay={0.4}>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-mist/20">
              {nextChapterLabel} ↓
            </span>
          </ScrollFadeIn>
        </div>
      )}
    </section>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
