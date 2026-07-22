'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getGsap } from '@/lib/gsap';
import { onIdle } from '@/lib/idle';
import { GSAP_EASING, STAGGER_TOKENS } from '@/lib/motion/tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';

type TitleTag = 'h1' | 'h2' | 'h3';

interface KineticTitleProps {
  /** Full heading text (single space separated). */
  text: string;
  /** Words rendered in the accent treatment (italic, champagne gold). */
  accentWords?: string[];
  as?: TitleTag;
  className?: string;
  /** Class applied to accent words. Defaults to italic + gold. */
  accentClassName?: string;
}

interface SplitWord {
  word: string;
  isAccent: boolean;
  chars: string[];
}

function splitWords(text: string, accentWords: string[]): SplitWord[] {
  return text
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => ({
      word,
      isAccent: accentWords.includes(word),
      chars: word.split(''),
    }));
}

/**
 * KineticTitle — activetheory.net-style kinetic typography.
 *
 * Section titles scrub-assemble letter by letter, tied to scroll progress
 * (NOT time): each char rises out of its word mask (`yPercent 115 → 0`),
 * unblurs (`blur(6px) → 0`) and fades in with the canonical `chars` stagger
 * and `easeOutExpo` shaping, scrubbed with a 1s smooth catch-up between
 * "top 85%" and "top 45%" of the viewport.
 *
 * Contract:
 * - Reduced motion / paused / quality tier `low`: renders plain semantic
 *   text (no split, no scrub) — the heading is simply there.
 * - Accessibility: the tag carries `aria-label={text}`; the split char
 *   layer is `aria-hidden`, so screen readers get the clean string.
 * - GSAP owns char transforms/filter only; surrounding wrappers may carry
 *   framer-motion parallax on ANCESTOR nodes (never the same node).
 * - `ScrollTrigger.refresh()` after `document.fonts.ready` keeps the scrub
 *   range honest once the real serif metrics land.
 */
export const KineticTitle = ({
  text,
  accentWords = [],
  as: Tag = 'h2',
  className,
  accentClassName = 'italic text-accent',
}: KineticTitleProps) => {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const { staticMode } = useMotionPolicy();
  const { tier } = useQualityTier();
  const isStatic = staticMode || tier.level === 'low';

  // Stable identity across parent re-renders (accent arrays are often inline).
  const accentKey = accentWords.join('');
  const words = useMemo(
    () => splitWords(text, accentKey ? accentKey.split('') : []),
    [text, accentKey],
  );

  useEffect(() => {
    if (isStatic) return;
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    const cancelIdle = onIdle(() => {
    void (async () => {
      const [gsap, scrollTriggerModule] = await Promise.all([
        getGsap(),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      const { ScrollTrigger } = scrollTriggerModule;

      const chars = root.querySelectorAll<HTMLElement>('[data-kt-char]');
      if (chars.length === 0) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          chars,
          { yPercent: 115, opacity: 0, filter: 'blur(6px)' },
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: GSAP_EASING.easeOutExpo,
            stagger: STAGGER_TOKENS.chars,
            scrollTrigger: {
              trigger: root,
              start: 'top 85%',
              end: 'top 45%',
              scrub: 1,
            },
          },
        );
      }, root);

      if (document.fonts?.ready) {
        void document.fonts.ready
          .then(() => ScrollTrigger.refresh())
          .catch(() => undefined);
      }
    })();
    }, 1200);

    return () => {
      cancelled = true;
      cancelIdle();
      ctx?.revert();
    };
  }, [isStatic, text, accentKey]);

  // Static path: plain semantic heading (reduced motion / low tier).
  if (isStatic) {
    const nodes: React.ReactNode[] = [];
    words.forEach(({ word, isAccent }, i) => {
      nodes.push(
        <span key={`${word}-${i}`} className={isAccent ? accentClassName : undefined}>
          {word}
        </span>,
      );
      if (i < words.length - 1) nodes.push(' ');
    });
    return <Tag className={className}>{nodes}</Tag>;
  }

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map(({ word, isAccent, chars }, wordIndex) => (
          <span
            key={`${word}-${wordIndex}`}
            className={cn(
              'inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]',
              isAccent && accentClassName,
            )}
          >
            {chars.map((char, charIndex) => (
              <span
                key={`${char}-${charIndex}`}
                data-kt-char=""
                className="inline-block will-change-transform"
                style={{ transform: 'translateY(115%)', opacity: 0 }}
              >
                {char}
              </span>
            ))}
            {wordIndex < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </Tag>
  );
};
