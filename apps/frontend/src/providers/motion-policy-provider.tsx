'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';

const PAUSE_STORAGE_KEY = 'hexa:animations-paused';

function readInitialPause(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PAUSE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

interface MotionPolicyContextValue {
  /** Site-level pause preference (persisted to localStorage). */
  paused: boolean;
  /** Toggle the pause state. */
  togglePause: () => void;
  /** Explicitly set pause state. */
  setPaused: (value: boolean) => void;
}

const MotionPolicyContext = createContext<MotionPolicyContextValue | null>(null);

export function MotionPolicyProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({ paused, togglePause, setPaused }),
    [paused, togglePause, setPaused],
  );

  return <MotionPolicyContext.Provider value={value}>{children}</MotionPolicyContext.Provider>;
}

/**
 * Access the site-level pause context. Throws if used outside
 * `MotionPolicyProvider`.
 */
export function useMotionPolicyContext(): MotionPolicyContextValue {
  const ctx = useContext(MotionPolicyContext);
  if (!ctx) {
    throw new Error('useMotionPolicyContext must be used within a <MotionPolicyProvider>');
  }
  return ctx;
}
