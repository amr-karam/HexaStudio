'use client';

import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export type WindowBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

/**
 * Returns the current window dimensions `{ width, height }`.
 *
 * The initial render uses `window.innerWidth` / `innerHeight` directly
 * (no SSR mismatch because this is a client component). The listener is
 * attached with `{ passive: true }` so it never blocks the main thread.
 *
 * @param delay  Optional throttle in milliseconds. When provided, the
 *               resize handler is throttled via `requestAnimationFrame`
 *               at the requested interval (0 = no throttle).
 *
 * @example
 * const { width } = useWindowSize();
 * const isDesktop = width >= 1024;
 */
export function useWindowSize(delay: number = 0): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame: number | null = null;
    let lastRun = 0;

    const updateSize = (): void => {
      const now = Date.now();
      if (delay > 0 && now - lastRun < delay) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          lastRun = now;
          setSize({ width: window.innerWidth, height: window.innerHeight });
        });
        return;
      }
      lastRun = now;
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const handleResize = (): void => {
      if (delay > 0) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(updateSize);
      } else {
        updateSize();
      }
    };

    const eventOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener('resize', handleResize, eventOptions);

    // Also listen for device-pixel-ratio changes on high-DPI displays.
    const mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mql.addEventListener('change', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mql.removeEventListener('change', handleResize);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [delay]);

  return size;
}

/**
 * Returns the current window dimensions plus a semantic breakpoint
 * category, following the HEXA STUDIO responsive breakpoints defined in
 * the design system.
 *
 * Breakpoints:
 * - `mobile`:      < 768px
 * - `tablet`:      768px – 1023px
 * - `desktop`:     1024px – 1279px
 * - `largeDesktop`: ≥ 1280px
 */
export function useWindowBreakpoint(): WindowSize & { breakpoint: WindowBreakpoint } {
  const size = useWindowSize();

  const breakpoint: WindowBreakpoint = size.width < 768 ? 'mobile' :
    size.width < 1024 ? 'tablet' :
    size.width < 1280 ? 'desktop' :
    'largeDesktop';

  return { ...size, breakpoint };
}
