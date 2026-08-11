'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useQualityTier } from '@/providers/quality-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { getGsap } from '@/lib/gsap';
import { onIdle } from '@/lib/idle';
import { OrnamentalRule, CornerFlourish, ChapterNumeral } from './BookOrnaments';

/**
 * StorybookChapter — a chapter from a fine press book.
 *
 * Visual language:
 * - Warm dark paper background with subtle gold undertone
 * - Double decorative border frame (SVG, low opacity)
 * - Corner flourishes (top-left, top-right)
 * - Large translucent Roman numeral in the top-left corner
 * - Centered chapter title with ornamental rules above and below
 * - Generous page-like padding, right-edge shadow for depth
 * - Content area with book-style typography
 *
 * Scroll behavior:
 * - Chapter content fades/slides in as it enters viewport
 * - Ornament elements stagger-reveal on first enter
 * - Respects reduced-motion and quality tiers
 */
export function StorybookChapter({
  children,
  chapterNumber,
  chapterTitle,
  id,
}: {
  children: ReactNode;
  chapterNumber: number;
  chapterTitle?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const { staticMode } = useMotionPolicy();
  const { tier } = useQualityTier();
  const isLowTier = tier.level === 'low';
  const animate = !staticMode && !isLowTier;

  // Scroll-driven fade + subtle vertical drift
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useSpring(useTransform(progress, [0, 0.15, 0.5, 1], [0.35, 1, 1, 0.92]));
  const y = useSpring(useTransform(progress, [0, 0.1, 1], [30, 0, -6]));

  // Stagger-reveal ornaments on first viewport enter
  useEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;

    const cancel = onIdle(async () => {
      const gsap = await getGsap();
      if (!gsap || !el) return;

      const ornaments = Array.from(el.querySelectorAll<HTMLElement>(
        '[data-storybook-ornament]',
      ));
      gsap.context(() => {
        ornaments.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 14, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: 0.12 + i * 0.07,
              ease: 'expo.out',
            },
          );
        });
      }, el);
    }, 2500);
    return cancel;
  }, [animate]);

  const idAttr = id ?? `ch-${chapterNumber}`;

  // Chapter intro: numeral + rules + title
  const chapterIntro = (
    <div className="relative z-10 max-w-3xl mx-auto text-center mb-16 md:mb-20">
      {/* Large chapter numeral */}
      <div aria-hidden="true" className="mb-8">
        <ChapterNumeral number={chapterNumber} />
      </div>

      {/* Upper ornamental rule */}
      <div aria-hidden="true" className="mb-5">
        <OrnamentalRule />
      </div>

      {/* Chapter title */}
      <h2
        id={`chapter-title-${chapterNumber}`}
        className="storybook-heading mb-3"
      >
        {chapterTitle}
      </h2>

      {/* Lower ornamental rule */}
      <div aria-hidden="true" className="mb-4">
        <OrnamentalRule />
      </div>
    </div>
  );

  return (
    <section
      ref={ref}
      id={idAttr}
      data-storybook-chapter=""
      className="storybook-page-padding page-shadow storybook-border relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(26,22,18,0.38) 0%, rgba(15,13,10,0.55) 100%)',
      }}
    >
      {/* Double border frame */}
      <div className="storybook-border absolute inset-0 pointer-events-none" />

      {/* Corner flourishes */}
      <CornerFlourish position="top-left" className="corner-flourish-tl" data-storybook-ornament />
      <CornerFlourish position="top-right" className="corner-flourish-tr" data-storybook-ornament />

      {/* Chapter numeral (top-left, behind everything) */}
      <div
        className="absolute top-6 left-6 md:top-8 md:left-8"
        aria-hidden="true"
        data-storybook-ornament
      >
        <ChapterNumeral number={chapterNumber} />
      </div>

      {/* Chapter intro: numeral + ornamental rules + title */}
      {chapterIntro}

      {/* Animate in the main content */}
      <motion.div
        className="relative z-10"
        style={{
          opacity,
          y,
        }}
      >
        {children}
      </motion.div>

      {/* Bottom ornamental rule */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        aria-hidden="true"
        data-storybook-ornament
      >
        <OrnamentalRule />
      </div>

      {/* Subtle left-edge page shadow */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 100%)',
        }}
      />
    </section>
  );
}
