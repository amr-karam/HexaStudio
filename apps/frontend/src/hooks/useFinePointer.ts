'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe reactive hook that returns `true` when the device has a fine pointer
 * (mouse/stylus) and `false` for coarse (touch).
 *
 * Live-reactive: updates when the user's input capability changes during the
 * session (e.g. connecting a mouse to a tablet).
 *
 * Default on server: `true` (assume fine pointer to avoid flicker on SSR).
 */
export function useFinePointer(): boolean {
  const [isFinePointer, setIsFinePointer] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsFinePointer(event.matches);
    };

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isFinePointer;
}
