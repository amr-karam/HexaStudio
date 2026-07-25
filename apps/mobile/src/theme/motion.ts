/**
 * Spring physics tokens — translated from HEXA Motion System (MOTION_SYSTEM.md §Spring Defaults).
 * Use with react-native-reanimated `withSpring(config)`.
 */
export const SPRING = {
  micro: { stiffness: 300, damping: 25, mass: 1 }, // Button hover, card lift
  group: { stiffness: 200, damping: 22, mass: 1 }, // Group reveals, link staggers
  heading: { stiffness: 180, damping: 22, mass: 1 }, // Section headers, hero titles
  paragraph: { stiffness: 150, damping: 20, mass: 1 }, // Supporting body text
  cta: { stiffness: 140, damping: 18, mass: 1 }, // Call-to-action reveals
  bottom: { stiffness: 100, damping: 20, mass: 1 }, // Footer, low-priority
} as const;

/**
 * Timing tokens — translated from MOTION_SYSTEM.md §Timing and Duration.
 */
export const TIMING = {
  micro: 200, // 150-300ms
  component: 300, // 300-500ms
  page: 600, // 600-900ms
  camera: 1200, // 1s-2s
  reduced: 200, // Reduced-motion: opacity-only 0.2s
} as const;

/**
 * Easing curves — translated from MOTION_SYSTEM.md §Easing.
 * Used with react-native-reanimated `withTiming(duration, { easing })`.
 */
import { Easing } from 'react-native-reanimated';

export const EASING = {
  entrance: Easing.bezier(0.16, 1, 0.3, 1), // Smooth decelerating — page loads, hero entrance
  interaction: Easing.bezier(0.34, 1.56, 0.64, 1), // Bouncy — button hover, tooltips
  transition: Easing.bezier(0.25, 0.1, 0.25, 1), // Balanced — modal opens, page slides
  sharp: Easing.bezier(0.4, 0, 0.6, 1), // Fast precise — error messages, toggles
} as const;

/**
 * Stagger delays for cascading reveals (MOTION_SYSTEM.md §Cascading Reveal).
 */
export const STAGGER = {
  step: 100, // 100ms between elements in a cascade
  reduced: 0, // No stagger under reduced motion
} as const;
