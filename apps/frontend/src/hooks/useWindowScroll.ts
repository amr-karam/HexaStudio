'use client';

import { useEffect, useState } from 'react';

export interface WindowScrollState {
  x: number;
  y: number;
}

/**
 * Tracks window scroll position (throttled via requestAnimationFrame).
 * @returns { x, y } scroll position
 */
export function useWindowScroll(): WindowScrollState {
  const [state, setState] = useState<WindowScrollState>(() => ({
    x: typeof window !== 'undefined' ? window.scrollX : 0,
    y: typeof window !== 'undefined' ? window.scrollY : 0,
  }));

  useEffect(() => {
    let ticking = false;
    const handleScroll = (): void => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setState({ x: window.scrollX, y: window.scrollY });
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return state;
}
