'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface ReadingProgressProps {
  className?: string;
}

/**
 * ReadingProgress — fixed top-edge hairline that fills as the user scrolls
 * through an article.
 *
 * Decoded from Prompt 017 §F5 (activetheory + demilie): a thin progress bar
 * at the very top of the viewport, `transform: scaleX` only (GPU-composited),
 * that tracks how far through the article the reader has scrolled.
 *
 * Contract:
 * - Uses `requestAnimationFrame` for smooth updates; RAF ID stored and
 *   cancelled on unmount.
 * - Consults `useMotionPolicy()`: under reduced motion or pause, the bar
 *   renders at 0 width (static) — no RAF loop.
 * - Renders as a `role="progressbar"` with `aria-valuenow` for screen readers.
 * - Zero layout cost: fixed position, `transform` only, single composited layer.
 */
export function ReadingProgress({ className }: ReadingProgressProps) {
  const { staticMode } = useMotionPolicy();
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (staticMode) {
      setProgress(0);
      return;
    }

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, scrollTop / docHeight));
      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [staticMode]);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-accent',
        'transition-none', // no CSS transitions — RAF drives the transform
        className,
      )}
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
