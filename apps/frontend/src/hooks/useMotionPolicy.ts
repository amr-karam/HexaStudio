'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFinePointer } from '@/hooks/useFinePointer';

const PAUSE_STORAGE_KEY = 'hexa:animations-paused';

function readInitialPause(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PAUSE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Unified motion policy hook that composes OS reduced-motion preference,
 * a site-level user toggle (persisted to localStorage), and fine-pointer
 * detection into a single policy object.
 *
 * Every animation in the app should read from this hook to decide whether
 * to run, and UI effects should gate pointer-driven interactions on
 * `finePointer`.
 */
export function useMotionPolicy() {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const [paused, setPausedState] = useState(readInitialPause);

  // Persist to localStorage whenever paused changes
  useEffect(() => {
    try {
      localStorage.setItem(PAUSE_STORAGE_KEY, String(paused));
    } catch {
      // localStorage may be unavailable in private browsing
    }
  }, [paused]);

  const togglePause = useCallback(() => {
    setPausedState((prev) => !prev);
  }, []);

  const setPaused = useCallback((value: boolean) => {
    setPausedState(value);
  }, []);

  const animationsEnabled = useMemo(() => !reducedMotion && !paused, [reducedMotion, paused]);
  const staticMode = useMemo(() => reducedMotion || paused, [reducedMotion, paused]);

  return useMemo(
    () => ({
      reducedMotion,
      paused,
      finePointer,
      animationsEnabled,
      staticMode,
      togglePause,
      setPaused,
    }),
    [reducedMotion, paused, finePointer, animationsEnabled, staticMode, togglePause, setPaused],
  );
}

export type MotionPolicy = ReturnType<typeof useMotionPolicy>;
