/**
 * HEXA Motion Tokens — Phase 1: Global Motion Foundation
 *
 * The single numeric source of truth for the Awwwards-grade motion layer.
 * Complements `src/lib/motion.ts` (semantic variants/policies) with the
 * canonical easing curves, durations, and stagger intervals every Phase-1
 * system consumes: smooth scroll, page transitions, cursor, preloader,
 * and micro-interactions.
 *
 * Philosophy: Motion is Communication. No linear defaults, ever.
 */

/* -------------------------------------------------------------------------- */
/*  EASING — Custom cubic beziers (the secret to luxury)                       */
/* -------------------------------------------------------------------------- */

/** Mutable cubic-bezier tuple — directly assignable to Framer Motion's `ease`. */
export type CubicBezier = [number, number, number, number];

export const EASING = {
  /** Smooth, decelerating — entrances, reveals, menu staggers. */
  easeOutExpo: [0.16, 1, 0.3, 1] as CubicBezier,
  /** Symmetric, cinematic — page-transition curtain, preloader lift. */
  easeInOutQuint: [0.76, 0, 0.24, 1] as CubicBezier,
} satisfies Record<string, CubicBezier>;

export type EasingName = keyof typeof EASING;

/** `cubic-bezier()` strings mirroring {@link EASING} for CSS transitions. */
export const CSS_EASING: Record<EasingName, string> = {
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOutQuint: 'cubic-bezier(0.76, 0, 0.24, 1)',
};

/** GSAP ease strings mirroring {@link EASING} for tween-driven systems. */
export const GSAP_EASING: Record<EasingName, string> = {
  easeOutExpo: 'expo.out',
  easeInOutQuint: 'quint.inOut',
};

/* -------------------------------------------------------------------------- */
/*  DURATION — seconds                                                         */
/* -------------------------------------------------------------------------- */

export const DUR = {
  /** 200ms — hover states, cursor feedback. Must feel instant. */
  micro: 0.2,
  /** 400ms — UI chrome: curtain cover/reveal legs, magnetic settle. */
  ui: 0.4,
  /** 800ms — scene-scale movement, hero imagery. */
  scene: 0.8,
  /** 700ms — full page transition envelope (curtain lift, preloader exit). */
  transition: 0.7,
} as const;

export type DurationName = keyof typeof DUR;

/* -------------------------------------------------------------------------- */
/*  STAGGER — choreographed reveals (seconds between siblings)                 */
/* -------------------------------------------------------------------------- */

export const STAGGER_TOKENS = {
  /** Per-character reveals (logotype, headlines). */
  chars: 0.03,
  /** Card grids, project lists. */
  cards: 0.06,
  /** Lines of text, mobile menu items. */
  lines: 0.08,
} as const;

export type StaggerName = keyof typeof STAGGER_TOKENS;

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

/** Framer Motion transition built from tokens. */
export function tokenTransition(
  easing: EasingName = 'easeOutExpo',
  duration: DurationName = 'ui',
  delay = 0,
): { ease: CubicBezier; duration: number; delay: number } {
  return { ease: EASING[easing], duration: DUR[duration], delay };
}
