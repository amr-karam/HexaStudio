'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useLocale } from '@/i18n/LocaleProvider';

/** Number of copies per loop half — enough to cover ultra-wide viewports. */
const REPEATS = 8;

/**
 * ContactRibbon — Cuberto-style infinite contact marquee above the footer.
 *
 * Decoded from cuberto.com (Prompt 017 — Scroll Cinema): a full-width
 * `contact—contact—contact` ribbon that closes every page as a persistent,
 * tactile CTA. The entire ribbon is a single link to /contact.
 *
 * Reuses the MarqueeBar engine contract (MOTION_SYSTEM.md):
 * - Static (centered, no animation) under reduced motion or site pause.
 * - Pauses on hover and focus-within (WCAG 2.2.2 Pause, Stop, Hide) —
 *   the pause doubles as the "ready to click" state.
 * - Animates `transform: translateX` only; linear easing is the explicit
 *   ambient-loop exception.
 * - Marquee copies are aria-hidden; the link carries one accessible name.
 */
export const ContactRibbon = () => {
  const { t } = useLocale();
  const { staticMode, paused } = useMotionPolicy();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const label = t('footer.startProject');
  const isStatic = staticMode || paused || isHovered || isFocusWithin;

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleFocus = useCallback(() => setIsFocusWithin(true), []);
  const handleBlur = useCallback(() => setIsFocusWithin(false), []);

  const itemClass =
    'flex items-center gap-8 whitespace-nowrap text-4xl md:text-6xl font-serif font-light uppercase tracking-tight transition-colors duration-500';

  return (
    <Link
      href="/contact"
      aria-label={label}
      data-cursor="explore"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="group block overflow-hidden border-b border-border/30 bg-surface py-10 md:py-14 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
    >
      {isStatic ? (
        <span aria-hidden="true" className="flex justify-center px-6">
          <span className={`${itemClass} text-foreground group-hover:text-accent group-focus-visible:text-accent`}>
            {label}
            <span className="font-sans not-italic text-2xl md:text-4xl text-accent" aria-hidden="true">
              &rarr;
            </span>
          </span>
        </span>
      ) : (
        <motion.span
          aria-hidden="true"
          className="flex w-max gap-8"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              duration: 36,
              ease: 'linear', // Explicit ambient-loop exception (MOTION_SYSTEM.md)
              repeat: Infinity,
            },
          }}
        >
          {Array.from({ length: REPEATS * 2 }, (_, i) => (
            <span key={i} className={`${itemClass} text-foreground/80`}>
              {label}
              <span className="font-sans text-lg md:text-xl text-accent" aria-hidden="true">
                &#9670;
              </span>
            </span>
          ))}
        </motion.span>
      )}
    </Link>
  );
};
