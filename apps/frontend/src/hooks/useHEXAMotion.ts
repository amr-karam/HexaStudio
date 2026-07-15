'use client';

import { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  EASE,
  DURATION,
  STAGGER,
  REDUCED_TRANSITION,
  makeTransition,
  type EaseName,
} from '@/lib/motion';
import type { Transition, Variants } from 'framer-motion';

/**
 * Universal HEXA motion hook.
 *
 * Wraps `useReducedMotion` and exposes HEXA-standard easings, durations, and
 * stagger values, plus a `reduced` flag. Any component using this hook
 * automatically honors the `prefers-reduced-motion` accessibility contract
 * defined in MOTION_SYSTEM.md — no per-component gating required.
 */
export function useHEXAMotion() {
  const reduced = useReducedMotion();

  const motion = useMemo(
    () => ({
      reduced,
      ease: EASE,
      duration: DURATION,
      stagger: STAGGER,
      /** Build a transition that collapses to instant when reduced. */
      transition: (ease: EaseName = 'entrance', duration: keyof typeof DURATION = 'component', delay = 0): Transition =>
        reduced ? REDUCED_TRANSITION : makeTransition(ease, duration, delay),
      /** Wrap any Variants so its `visible` state respects reduced motion. */
      withReduced: (variants: Variants): Variants => ({
        ...variants,
        visible: ((custom?: unknown) =>
          typeof variants.visible === 'function'
            ? (variants.visible as (c?: unknown) => unknown)(custom ?? reduced)
            : reduced
              ? { ...(variants.visible as object), transition: REDUCED_TRANSITION }
              : (variants.visible as object)) as unknown as Variants['visible'],
      }),
    }),
    [reduced],
  );

  return motion;
}

export { EASE, DURATION, STAGGER } from '@/lib/motion';
