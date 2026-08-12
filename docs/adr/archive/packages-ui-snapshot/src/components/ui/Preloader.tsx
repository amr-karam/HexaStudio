'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { LUXURY_EASE } from '../../lib/motion';

/**
 * Preloader — cinematic boot sequence for the public site.
 * Minimal progress bar + architectural grid overlay + "initializing" caption.
 * Respects `prefers-reduced-motion` (skips the countdown when reduced).
 */
export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = React.useState(0);
  const completeRef = React.useRef(onComplete);
  completeRef.current = onComplete;

  React.useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(100);
      const t = window.setTimeout(() => completeRef.current(), 150);
      return () => window.clearTimeout(t);
    }

    let value = 0;
    const interval = window.setInterval(() => {
      value = Math.min(100, value + Math.random() * 14 + 4);
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(interval);
        window.setTimeout(() => completeRef.current(), 450);
      }
    }, 140);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center overflow-hidden bg-[var(--color-primary)]"
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: LUXURY_EASE }}
      role="status"
      aria-label="Loading HEXA STUDIO"
    >
      {/* Architectural grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-primary-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fg) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md px-10">
        <div className="mb-5 flex items-end justify-between">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--color-neutral-400)]"
          >
            Initializing Experience
          </motion.span>
          <span className="font-serif text-3xl leading-none text-[var(--color-accent)] tabular-nums">
            {Math.round(progress)}
            <span className="text-base text-[var(--color-neutral-500)]">%</span>
          </span>
        </div>

        <div className="relative h-px w-full overflow-hidden bg-[var(--color-neutral-800)]">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--color-accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 flex justify-between text-[9px] uppercase tracking-[0.2em] text-[var(--color-neutral-600)]">
          <span>Hexa Studio</span>
          <span>Architecture Visualization</span>
        </div>
      </div>
    </motion.div>
  );
};
