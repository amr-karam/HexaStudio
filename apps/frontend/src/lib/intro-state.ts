'use client';

/**
 * Intro completion state — module-scoped memory of whether the cinematic
 * preloader has lifted (or been skipped) during this JS lifetime.
 *
 * Why a module: `PageTransition` never remounts the tree on route change,
 * but Next.js still swaps page components — so per-component refs reset on
 * navigation while module state persists across SPA navigations and resets
 * only on full reload (which is exactly the preloader's own semantics).
 */

export const INTRO_COMPLETE_EVENT = 'hexa:intro-complete';

let introCompleted = false;

export function hasIntroCompleted(): boolean {
  return introCompleted;
}

export function markIntroComplete(): void {
  introCompleted = true;
  window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT));
}
