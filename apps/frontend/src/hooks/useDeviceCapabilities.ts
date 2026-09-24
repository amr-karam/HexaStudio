'use client';

import { useEffect, useState } from 'react';

/**
 * useDeviceCapabilities — detects device performance tier and motion preferences
 * to enable adaptive quality and progressive enhancement.
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isLowEnd: false,
    isHighEnd: false,
    prefersReducedMotion: false,
    deviceMemory: 4,
    hardwareConcurrency: 4,
    connectionType: 'unknown',
  });

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const deviceMemory = (nav as Navigator & { deviceMemory?: number })?.deviceMemory ?? 4;
    const hardwareConcurrency = nav?.hardwareConcurrency ?? 4;
    const connection = nav ? (nav as Navigator & { connection?: { effectiveType?: string } }).connection : null;
    const connectionType = connection?.effectiveType || 'unknown';
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isLowEnd = deviceMemory <= 2 || hardwareConcurrency <= 2;
    const isHighEnd = deviceMemory >= 8 && hardwareConcurrency >= 8;

    setCapabilities({
      isLowEnd,
      isHighEnd,
      prefersReducedMotion,
      deviceMemory,
      hardwareConcurrency,
      connectionType,
    });
  }, []);

  return capabilities;
}
