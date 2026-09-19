'use client';

import { useEffect, useState } from 'react';

/**
 * useMotionPolicy — Detects user's reduced motion preference
 * and provides a boolean for gating 3D/animation features.
 *
 * Used by CinematicScene to render static fallback when
 * prefers-reduced-motion is set.
 */
export function useMotionPolicy() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { shouldReduceMotion };
}
