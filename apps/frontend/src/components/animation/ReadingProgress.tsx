'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface ReadingProgressProps {
  className?: string;
}

/** Minimum interval between `aria-valuenow` updates (screen-reader contract). */
const ARIA_THROTTLE_MS = 200;
/** Resize debounce before the cached document height is recomputed. */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * ReadingProgress — fixed top-edge hairline that fills as the user scrolls
 * through an article.
 *
 * Decoded from Prompt 017 §F5 (activetheory + demilie): a thin progress bar
 * at the very top of the viewport, `transform: scaleX` only (GPU-composited),
 * that tracks how far through the article the reader has scrolled.
 *
 * Performance contract (revision 2 — forced-reflow kill):
 * - NO permanent rAF loop: an idle page performs zero work. Updates are
 *   driven by a passive window `scroll` listener (Lenis animates via
 *   `window.scrollTo`, so native scroll events fire under smooth scroll too)
 *   plus the Lenis `scroll` event when the instance exists. Every source is
 *   coalesced into at most ONE rAF flush per frame.
 * - `document.documentElement.scrollHeight` is cached in a ref and recomputed
 *   only on a debounced resize — never in the per-frame path (the previous
 *   implementation forced a layout read on every frame).
 * - Progress is written straight to the DOM via `barRef` — zero React
 *   re-renders during scroll. `aria-valuenow` is updated with `setAttribute`
 *   at most every `ARIA_THROTTLE_MS`.
 * - Under reduced motion / pause (`useMotionPolicy` staticMode) the bar
 *   renders at 0 width with no listeners attached.
 * - Zero layout cost: fixed position, `transform` only, single composited
 *   layer.
 */
export function ReadingProgress({ className }: ReadingProgressProps) {
  const { staticMode } = useMotionPolicy();
  const barRef = useRef<HTMLDivElement>(null);
  const docHeightRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastAriaUpdateRef = useRef(0);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const resetBar = () => {
      bar.style.transform = 'scaleX(0)';
      bar.setAttribute('aria-valuenow', '0');
    };

    if (staticMode) {
      resetBar();
      return;
    }

    const measureDocHeight = () => {
      docHeightRef.current =
        document.documentElement.scrollHeight - window.innerHeight;
    };

    const flush = () => {
      rafIdRef.current = null;
      const max = docHeightRef.current;
      if (max <= 0) {
        bar.style.transform = 'scaleX(0)';
        return;
      }
      const progress = Math.min(1, window.scrollY / max);
      bar.style.transform = `scaleX(${progress})`;

      const now = performance.now();
      if (now - lastAriaUpdateRef.current >= ARIA_THROTTLE_MS) {
        lastAriaUpdateRef.current = now;
        bar.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      }
    };

    const scheduleFlush = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(flush);
      }
    };

    // Reflect a restored scroll position (browser back / reload) immediately.
    measureDocHeight();
    flush();

    // Lenis emits 'scroll' when smooth scroll is active; its animation also
    // fires native window scroll events (`window.scrollTo`), so the passive
    // listener covers both modes. Both sources funnel into the same coalesced
    // flush — at most one rAF per frame.
    const onScroll = () => scheduleFlush();
    window.addEventListener('scroll', onScroll, { passive: true });

    const lenis = window.__lenis;
    lenis?.on('scroll', onScroll);

    let resizeTimer: number | null = null;
    const onResize = () => {
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        measureDocHeight();
        scheduleFlush();
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      lenis?.off('scroll', onScroll);
    };
  }, [staticMode]);

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-accent',
        'transition-none', // no CSS transitions — rAF-coalesced scroll updates drive the transform
        className,
      )}
      style={{ transform: 'scaleX(0)' }}
    />
  );
}
