/**
 * HEXA Motion — Scroll-reactive mapping utilities (Phase 2A).
 *
 * Pure functions converting the normalized scroll velocity from
 * `useScrollVelocity` ([-1, 1], positive = scrolling down) into visual
 * parameters for the velocity-reactive marquee and future scroll cinema
 * systems. Kept side-effect free so they are unit-testable in isolation.
 *
 * Inspiration: animation-addons.com velocity marquee — the interface leans
 * and accelerates with the user's scroll energy, then settles elastically.
 */

/** Clamp `value` into the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Absolute cap (degrees) for velocity-driven skew — never legible-breaking. */
export const MAX_MARQUEE_SKEW_DEG = 6;

/** Upper bound for the velocity speed multiplier (idle = 1×). */
export const MAX_MARQUEE_SPEED_FACTOR = 3.5;

/**
 * Maps normalized scroll velocity to a marquee/track skew in degrees.
 *
 * Sign convention: scrolling down (positive velocity) leans the track
 * backwards (negative skewX), so the type appears to trail the scroll —
 * the physical "dragged by inertia" feel. Output is clamped to
 * ±`maxSkewDeg` so headings never become illegible.
 */
export function velocityToSkew(velocity: number, maxSkewDeg = MAX_MARQUEE_SKEW_DEG): number {
  if (velocity === 0) return 0;
  return clamp(-velocity * maxSkewDeg, -maxSkewDeg, maxSkewDeg);
}

export interface SpeedFactorOptions {
  /** Multiplier gain per unit of |velocity|. Default 2.5. */
  boost?: number;
  /** Hard cap on the resulting factor. Default {@link MAX_MARQUEE_SPEED_FACTOR}. */
  max?: number;
}

/**
 * Maps normalized scroll velocity to a speed multiplier for ambient loops.
 * Idle scroll (velocity 0) always returns exactly 1 so the base cadence is
 * preserved; the factor scales with |velocity| (direction-agnostic) and is
 * clamped to `max`.
 */
export function velocityToSpeedFactor(
  velocity: number,
  { boost = 2.5, max = MAX_MARQUEE_SPEED_FACTOR }: SpeedFactorOptions = {},
): number {
  return clamp(1 + Math.abs(velocity) * boost, 1, max);
}
