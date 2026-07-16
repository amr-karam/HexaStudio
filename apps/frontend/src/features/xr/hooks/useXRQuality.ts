'use client';

import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { XR_QUALITY } from '../config/xr-config';

export function useXRQuality() {
  const base = useAdaptiveQuality();

  return {
    level: base.level,
    settings: {
      ...base.settings,
      dpr: XR_QUALITY.dpr,
      shadows: false,
      postProcessing: false,
    },
  };
}
