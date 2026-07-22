'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DUR, EASING } from '@/lib/motion/tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface ScrollCueProps {
  label?: string;
  className?: string;
  /** Seconds before the cue fades in (choreographed after the hero cascade). */
  delay?: number;
}

/**
 * ScrollCue — "Scroll to explore" mono cue with an animated gold hairline.
 *
 * - The hairline travels down its track on a gentle loop (token easing).
 * - The cue fades out permanently after the FIRST scroll gesture — listeners
 *   are registered `{ once: true }` on both the Lenis instance (when smooth
 *   scroll is active) and native scroll/wheel/touchmove fallbacks.
 * - Reduced motion: no loop (static hairline) and the exit is opacity-only.
 */
export const ScrollCue = ({ label = 'Scroll to explore', className, delay = 1.2 }: ScrollCueProps) => {
  const { staticMode } = useMotionPolicy();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const dismiss = () => setIsDismissed(true);

    // Lenis is the primary scroll source when smooth scroll is active.
    const lenis = window.__lenis;
    const onLenisScroll = () => {
      dismiss();
      lenis?.off('scroll', onLenisScroll);
    };
    lenis?.on('scroll', onLenisScroll);

    // Native fallbacks (no Lenis on low tier / reduced motion / edge cases).
    window.addEventListener('scroll', dismiss, { once: true, passive: true });
    window.addEventListener('wheel', dismiss, { once: true, passive: true });
    window.addEventListener('touchmove', dismiss, { once: true, passive: true });

    return () => {
      lenis?.off('scroll', onLenisScroll);
      window.removeEventListener('scroll', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchmove', dismiss);
    };
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: staticMode ? 0 : 12,
            transition: { duration: DUR.micro, ease: EASING.easeOutExpo },
          }}
          transition={{ duration: DUR.ui, ease: EASING.easeOutExpo, delay }}
          className={cn(
            'pointer-events-none absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4',
            className,
          )}
          aria-hidden="true"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
            {label}
          </span>
          <span className="relative block h-16 w-px overflow-hidden bg-white/5">
            {staticMode ? (
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-accent/70 to-transparent" />
            ) : (
              <motion.span
                animate={{ y: ['-100%', '220%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: EASING.easeInOutQuint }}
                className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-accent/70 to-transparent"
              />
            )}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
