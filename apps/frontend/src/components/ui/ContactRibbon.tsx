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
 * - Marquee copies are aria-hidden siblings of the link; the link is an
 *   inset overlay carrying one accessible name (aria-label), so the repeated
 *   visible ribbon text never pollutes the accessible name computation
 *   (WCAG 2.5.3 label-content-name-mismatch).
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
    <div className="group relative overflow-hidden border-b border-sl-silver/20 bg-sl-obsidian py-10 md:py-14">
      <Link
        href="/contact"
        aria-label={label}
        data-cursor="explore"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sl-gold-subtle"
      />
      {isStatic ? (
        <span aria-hidden="true" className="flex justify-center px-6">
          <span className={`${itemClass} text-sl-alabaster group-hover:text-sl-gold-hover group-focus-visible:text-sl-gold-hover`}>
            {label}
            <span className="font-sans not-italic text-2xl md:text-4xl text-sl-gold-hover" aria-hidden="true">
              &rarr;
            </span>
          </span>
        </span>
      ) : (
        <motion.span
          aria-hidden="true"
          className="flex w-max gap-8 pointer-events-none"
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
            <span key={i} className={`${itemClass} text-sl-alabaster/80`}>
              {label}
              <span className="font-sans text-lg md:text-xl text-sl-gold-hover" aria-hidden="true">
                &#9670;
              </span>
            </span>
          ))}
        </motion.span>
      )}
    </div>
  );
};
