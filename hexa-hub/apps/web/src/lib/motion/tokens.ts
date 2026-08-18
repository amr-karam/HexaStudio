/**
 * HEXA STUDIO — Motion Tokens
 * Canonical motion easing curves and durations.
 * These mirror the CSS custom properties in src/app/globals.css
 * so JavaScript animation libraries (framer-motion) can reference
 * the same timing functions used by CSS transitions.
 */

export const hexaEasing = {
  /** Standard entrance animation — smooth, natural acceleration */
  entrance: [0.16, 1, 0.3, 1] as const,
  /** Expressive interaction — slight overshoot for button hover/active */
  interaction: [0.34, 1.56, 0.64, 1] as const,
  /** Standard transition — balanced fade and slide */
  transition: [0.25, 0.1, 0.25, 1] as const,
  /** Sharp — quick, decisive animation */
  sharp: [0.4, 0, 0.6, 1] as const,
  /** Cinematic — dramatic reveal for hero elements */
  cinematic: [0.76, 0, 0.24, 1] as const,
} as const;

export const hexaDuration = {
  /** Micro interactions (hover, tap) */
  micro: 0.2,
  /** Component-level transitions (expand/collapse) */
  component: 0.4,
  /** Scene-level animations (page transitions) */
  scene: 0.8,
  /** Section transitions */
  transition: 0.7,
  /** Page-level entrance */
  page: 0.75,
  /** Cinematic reveals */
  camera: 1.4,
} as const;

export const hexaStagger = {
  /** Character-level stagger for text reveals */
  char: 0.03,
  /** Card/item stagger for grids */
  card: 0.08,
  /** Line-level stagger for lists */
  line: 0.05,
} as const;

/** Convenience: pre-built framer-motion transition presets. */
export const hexaTransition = {
  entrance: {
    duration: hexaDuration.component,
    ease: hexaEasing.entrance,
  },
  interaction: {
    duration: hexaDuration.micro,
    ease: hexaEasing.interaction,
  },
  sharp: {
    duration: hexaDuration.micro,
    ease: hexaEasing.sharp,
  },
  cinematic: {
    duration: hexaDuration.page,
    ease: hexaEasing.cinematic,
  },
  stagger: {
    card: {
    duration: hexaDuration.scene,
    ease: hexaEasing.entrance,
      staggerChildren: hexaStagger.card,
      delayChildren: hexaStagger.card,
    },
  },
} as const;

export default { hexaEasing, hexaDuration, hexaStagger, hexaTransition };
