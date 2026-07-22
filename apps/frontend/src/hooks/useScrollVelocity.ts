'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';
import type Lenis from 'lenis';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface ScrollVelocityOptions {
  /**
   * Scroll speed (px per frame at 60fps) that maps to a normalized velocity
   * of ±1. Higher values make the output less sensitive.
   */
  max?: number;
}

/** Multiplier applied every decay frame to ease velocity back to rest. */
const DECAY_FACTOR = 0.88;
/** Below this magnitude the velocity snaps to 0 and the decay loop stops. */
const REST_THRESHOLD = 0.001;

/**
 * useScrollVelocity — normalized scroll velocity as a framer-motion value.
 *
 * Decoded from demilie.ru / cuberto.com (Prompt 017 — Scroll Cinema): image
 * shear, skew, and drag effects proportional to how fast the user scrolls.
 *
 * Returns a `MotionValue<number>` in the range [-1, 1] (positive = scrolling
 * down). Consumers compose it with `useTransform` so updates bypass React
 * renders entirely.
 *
 * Contract (MOTION_SYSTEM.md):
 * - Static mode (reduced motion or paused): no listeners attach and the
 *   value stays at 0 — dependent effects render at rest.
 * - Prefers the Lenis instance (`window.__lenis`) when smooth scroll is
 *   active; falls back to native scroll deltas otherwise.
 * - The decay RAF loop stores its id and is cancelled on unmount.
 */
export function useScrollVelocity({ max = 40 }: ScrollVelocityOptions = {}): MotionValue<number> {
  const velocity = useMotionValue(0);
  const { staticMode } = useMotionPolicy();
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (staticMode) {
      velocity.set(0);
      return;
    }

    const clamp = (value: number) => Math.max(-1, Math.min(1, value));

    /** Eases velocity back to 0 once scroll input stops. Self-terminating. */
    const decay = () => {
      const current = velocity.get();
      const next = Math.abs(current) < REST_THRESHOLD ? 0 : current * DECAY_FACTOR;
      velocity.set(next);
      rafId.current = next === 0 ? null : requestAnimationFrame(decay);
    };

    const kick = (normalized: number) => {
      velocity.set(clamp(normalized));
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(decay);
      }
    };

    const stop = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      velocity.set(0);
    };

    const lenis = window.__lenis;
    if (lenis) {
      const onLenisScroll = (instance: Lenis) => kick(instance.velocity / max);
      lenis.on('scroll', onLenisScroll);
      return () => {
        lenis.off('scroll', onLenisScroll);
        stop();
      };
    }

    let lastY = window.scrollY;
    let lastTime = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const elapsed = Math.max(now - lastTime, 1);
      const pxPerFrame = ((window.scrollY - lastY) / elapsed) * (1000 / 60);
      lastY = window.scrollY;
      lastTime = now;
      kick(pxPerFrame / max);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      stop();
    };
  }, [staticMode, max, velocity]);

  return velocity;
}
