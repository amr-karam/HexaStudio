'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';
import { useQualityTier } from '@/providers/quality-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { getGsap } from '@/lib/gsap';
import { onIdle } from '@/lib/idle';
import { OrnamentalRule, CornerFlourish, ChapterNumeral, PageBorderSVG } from './BookOrnaments';

/** Book-page decorative border overlay (absolute-positioned SVG). */
function BookBorder({ className }: { className?: string }) {
  return <PageBorderSVG className={className} />;
}

/**
 * StorybookChapter — wraps a homepage section with book-page aesthetics.
 *
 * Visual treatment:
 * - Warm paper-tone background (very subtle, doesn't fight the dark theme)
 * - Hanging decorative border frame (SVG, low opacity gold)
 * - Corner flourishes (top-left / top-right)
 * - Large translucent chapter numeral in the top-left
 * - Ornamental rule above the chapter heading area
 * - Generous page-margin padding (feels like a printed page)
 * - Subtle page shadow on the right edge
 *
 * Scroll behavior:
 * - Content gently fades/slides in as the chapter enters the viewport
 * - Respects reduced-motion (renders plainly)
 * - Respects quality tier (low tier = no animations)
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
  const shouldAnimate = !staticMode && !isLowTier;

  // Scroll-driven fade + slide for the chapter content
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useSpring(useTransform(progress, [0, 0.15, 0.5, 1], [0.4, 1, 1, 0.95]));
  const y = useSpring(useTransform(progress, [0, 0.12, 1], [40, 0, -8]));

  // On-first-enter GSAP micro-animation for ornament reveal
  useEffect(() => {
    const el = ref.current;
    if (!shouldAnimate || !el) return;

    const cancel = onIdle(() => {
      getGsap().then((gsap) => {

        const ornaments = Array.from(el.querySelectorAll<HTMLElement>(
          '[data-storybook-ornament]',
        ));
        gsap.context(() => {
          ornaments.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: 0.15 + i * 0.08,
              ease: 'expo.out',
            },
          );
          });
        }, el);
      });
    }, 2000);
    return cancel;
  }, [shouldAnimate]);

  const idAttr = id ?? `ch-${chapterNumber}`;

  return (
    <section
      ref={ref}
      id={idAttr}
      data-storybook-chapter=""
      style={{
        position: 'relative',
       background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.4) 0%, rgba(15, 13, 10, 0.5) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
        padding: 'clamp(48px, 8vw, 96px)',
        margin: '0 auto',
        maxWidth: '1200px',
        boxShadow: '4px 0 40px rgba(0,0,0,0.3), inset 0 0 80px rgba(212, 175, 55, 0.02)',
      }}
    >
      {/* Book page border overlay */}
      {shouldAnimate && <BookBorder className="pointer-events-none" />}

      {/* Corner flourishes */}
      <CornerFlourish position="top-left" className="absolute top-8 left-8 md:top-12 md:left-12 data-[storybook-ornament] data-storybook-ornament" data-storybook-ornament />
      <CornerFlourish position="top-right" className="absolute top-8 right-8 md:top-12 md:right-12 data-[storybook-ornament] data-storybook-ornament" data-storybook-ornament />

      {/* Chapter numeral — large translucent Roman numeral */}
      <div
        className="absolute top-8 left-8 md:top-12 md:left-12 data-[storybook-ornament] data-storybook-ornament"
        data-storybook-ornament
        aria-hidden="true"
      >
        <ChapterNumeral number={chapterNumber} />
      </div>

      {/* Chapter title with ornamental rule above */}
      {chapterTitle && (
        <div
          className="absolute top-1/2 right-12 md:right-16 transform -translate-y-1/2 text-right data-[storybook-ornament] data-storybook-ornament"
          data-storybook-ornament
        >
          <div
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(212, 175, 55, 0.3)',
              lineHeight: 1.4,
            }}
          >
            {chapterTitle}
          </div>
          <div style={{ marginTop: '12px', height: '1px', width: '60px', background: 'rgba(212, 175, 55, 0.2)' }} />
        </div>
      )}

      {/* Animate in on scroll */}
      <div
        style={{
          opacity: opacity as unknown as number,
          transform: y as unknown as string,
          transition: 'box-shadow 0.6s ease',
        }}
      >
        {children}
      </div>

      {/* Bottom ornamental double-rule */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <OrnamentalRule />
      </div>
    </section>
  );
}
