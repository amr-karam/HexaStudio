/**
 * HEXA Motion Tokens — Phase 1: Global Motion Foundation
 *
 * COMPATIBILITY LAYER: This module re-exports the canonical tokens from
 * `src/lib/motion.ts` (the single source of truth) under the Phase-1 names.
 * New code should import directly from `@/lib/motion`.
 *
 * Original philosophy: Motion is Communication. No linear defaults, ever.
 */

import { EASE, DURATION } from '../motion';

export type CubicBezier = readonly [number, number, number, number];

/** Phase-1 easing aliases (map to canonical EASE values). */
export const EASING = {
  easeOutExpo: EASE.entrance,
  easeInOutQuint: EASE.cinematic,
} as const;

export type EasingName = keyof typeof EASING;

/** `cubic-bezier()` strings mirroring {@link EASING} for CSS transitions. */
export const CSS_EASING: Record<EasingName, string> = {
  easeOutExpo: `cubic-bezier(${EASE.entrance.join(', ')})`,
  easeInOutQuint: `cubic-bezier(${EASE.cinematic.join(', ')})`,
};

/** GSAP ease strings mirroring {@link EASING} for tween-driven systems. */
export const GSAP_EASING: Record<EasingName, string> = {
  easeOutExpo: 'expo.out',
  easeInOutQuint: 'quint.inOut',
};

/** Phase-1 duration aliases (map to canonical DURATION values). */
export const DUR = {
  micro: DURATION.micro,
  ui: DURATION.component,
  scene: DURATION.scene,
  transition: DURATION.transition,
} as const;

export type DurationName = keyof typeof DUR;

/** Fine-grained stagger intervals (Phase-1 granularity; STAGGER in motion.ts is coarser). */
export const STAGGER_TOKENS = {
  chars: 0.03,
  cards: 0.06,
  lines: 0.08,
} as const;

export type StaggerName = keyof typeof STAGGER_TOKENS;

/** Framer Motion transition built from tokens. */
export function tokenTransition(
  easing: EasingName = 'easeOutExpo',
  duration: DurationName = 'ui',
  delay = 0,
): { ease: CubicBezier; duration: number; delay: number } {
  return { ease: EASING[easing], duration: DUR[duration], delay };
}
