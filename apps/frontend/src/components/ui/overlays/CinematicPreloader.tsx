'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * CinematicPreloader — Luxury film-studio intro.
 *
 * A self-drawing hexagonal logo (SVG `pathLength`), a pulsing gold halo,
 * a gold-gradient progress bar with a travelling shimmer sweep, and a
 * refined wordmark + tagline. Accessibility contract preserved: the
 * overlay announces itself once via `role="status"` / `aria-live="polite"`,
 * collapses instantly for reduced-motion users, and never spams the label
 * as the percentage ticks up.
 */
export function CinematicPreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Reduced-motion users get a near-instant hand-off to content.
    if (reducedMotion) {
      const t = setTimeout(() => setIsComplete(true), 200);
      return () => clearTimeout(t);
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsComplete(true), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [reducedMotion]);

  // The hexagon outline draws itself in step with the progress bar.
  const drawProgress = Math.min(progress / 100, 1);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: EASE.entrance } }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="Loading HexaStudio experience"
        >
          <div className="relative w-full max-w-md px-8 flex flex-col items-center">
            {/* Hexagonal logo + pulsing gold halo */}
            <div className="relative mb-8 h-[72px] w-[72px] flex items-center justify-center">
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)' }}
                animate={reducedMotion ? { opacity: 0.2 } : { opacity: [0.1, 0.3, 0.1] }}
                transition={reducedMotion ? { duration: 0.01 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                className="relative z-10"
                aria-hidden="true"
              >
                <motion.path
                  d="M30 4 L52.3 17 L52.3 43 L30 56 L7.7 43 L7.7 17 Z"
                  stroke="var(--color-accent)"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: drawProgress, opacity: 1 }}
                  transition={{ ease: 'linear' }}
                />
              </svg>
            </div>

            {/* Wordmark */}
            <div className="flex flex-col items-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-mono">
                Initializing
              </span>
              <span className="mt-2 text-xl uppercase tracking-[0.3em] text-foreground font-light">
                HexaStudio
              </span>
            </div>

            {/* Progress bar with gold gradient fill + shimmer sweep */}
            <div className="relative w-full">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-mono">
                  Loading
                </span>
                <span className="text-sm font-serif font-light text-accent italic">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="h-[1px] w-full bg-neutral-800 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 start-0 bg-gradient-to-r from-accent-dark via-accent to-accent-light"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
                {/* Shimmer sweep — a thin white highlight travels along the bar */}
                {!reducedMotion && (
                  <motion.div
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    initial={{ left: '-24%' }}
                    animate={{ left: '100%' }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      repeatDelay: 0.2,
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Tagline */}
              <p className="mt-4 text-center text-[11px] uppercase tracking-[0.4em] text-accent/40 font-mono">
                Architecture Visualized
              </p>
            </div>

            <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/5 blur-[100px] rounded-full" aria-hidden="true" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/5 blur-[100px] rounded-full" aria-hidden="true" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
