/**
 * HEXA Motion System — Single Source of Truth
 *
 * Derived from HEXA-Vision-Playbook/06-STANDARDS/MOTION_SYSTEM.md (v1.0.0).
 * Every animation in the frontend must source its easing, duration, and
 * stagger from this module to guarantee a handcrafted, cinematic feel and
 * absolute consistency across the entire experience.
 *
 * Philosophy: Motion is Communication. We never use linear/default easing.
 */

import type { Transition, Variants } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  EASING — Custom Cubic Beziers (the secret to luxury)                       */
/* -------------------------------------------------------------------------- */

export const EASE = {
  /** Smooth, decelerating — page loads, hero entrance */
  entrance: [0.16, 1, 0.3, 1] as const,
  /** Bouncy, playful — button hover, tooltips */
  interaction: [0.34, 1.56, 0.64, 1] as const,
  /** Balanced — modal opens, page slides */
  transition: [0.25, 0.1, 0.25, 1] as const,
  /** Fast, precise — error messages, toggles */
  sharp: [0.4, 0, 0.6, 1] as const,
} satisfies Record<string, readonly [number, number, number, number]>;

export type EaseName = keyof typeof EASE;

/* -------------------------------------------------------------------------- */
/*  DURATION — Timing (ms)                                                     */
/* -------------------------------------------------------------------------- */

export const DURATION = {
  micro: 0.2, // 150–300ms → mid value, micro-interactions
  component: 0.4, // 300–500ms → mid value, component transitions
  page: 0.75, // 600–900ms → mid value, page transitions
  camera: 1.4, // 1s–2s → mid value, 3D camera moves
} as const;

/* -------------------------------------------------------------------------- */
/*  STAGGER — Choreographed reveals                                            */
/* -------------------------------------------------------------------------- */

export const STAGGER = {
  micro: 0, // micro-interactions: 0ms
  component: 0.05, // component transitions: 50ms
  page: 0.1, // page transitions: 100ms
} as const;

/* -------------------------------------------------------------------------- */
/*  REDUCED MOTION — Accessibility contract (MOTION_SYSTEM.md §Performance)    */
/* -------------------------------------------------------------------------- */

/**
 * When `prefers-reduced-motion: reduce` is set, every non-essential animation
 * collapses to an instant, opacity-only transition. These variants are the
 * safe fallbacks consumed by `useHEXAMotion()`.
 */
export const REDUCED_TRANSITION: Transition = {
  duration: 0.01,
  ease: EASE.sharp,
};

/* -------------------------------------------------------------------------- */
/*  COMPOSABLE TRANSITIONS                                                     */
/* -------------------------------------------------------------------------- */

export function makeTransition(
  ease: EaseName = 'entrance',
  duration: keyof typeof DURATION = 'component',
  delay = 0,
): Transition {
  return { ease: EASE[ease] as [number, number, number, number], duration: DURATION[duration], delay } as Transition;
}

/* -------------------------------------------------------------------------- */
/*  VARIANTS — Reusable choreography                                           */
/* -------------------------------------------------------------------------- */

/** Fade + lift entrance, used for hero text, section headers. */
export const fadeLift: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (reduced: boolean) =>
    reduced
      ? { opacity: 1, y: 0, transition: REDUCED_TRANSITION }
      : { opacity: 1, y: 0, transition: makeTransition('entrance', 'component') },
};

/** Masked text reveal — content slides up from behind a clip mask. */
export const textReveal: Variants = {
  hidden: { y: '110%' },
  visible: (reduced: boolean) =>
    reduced
      ? { y: '0%', transition: REDUCED_TRANSITION }
      : { y: '0%', transition: makeTransition('entrance', 'page') },
};

/** Parent variant that staggers its children into view once. */
export const staggerContainer = (stagger = STAGGER.component, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Scale-in for 3D / showcase objects (MOTION_SYSTEM.md §3D Motion). */
export const scaleSpring: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (reduced: boolean) =>
    reduced
      ? { opacity: 1, scale: 1, transition: REDUCED_TRANSITION }
      : { opacity: 1, scale: 1, transition: makeTransition('interaction', 'component') },
};

/** Standard overlay / modal entrance. */
export const overlay: Variants = {
  hidden: { opacity: 0 },
  visible: (reduced: boolean) =>
    reduced ? { opacity: 1, transition: REDUCED_TRANSITION } : { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: (reduced: boolean) =>
    reduced
      ? { opacity: 1, scale: 1, y: 0, transition: REDUCED_TRANSITION }
      : {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: makeTransition('transition', 'page'),
        },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.25, ease: EASE.sharp } },
};
