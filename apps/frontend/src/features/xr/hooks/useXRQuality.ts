'use client';

import { useQualityTier } from '@/providers/quality-provider';
import { XR_QUALITY } from '../config/xr-config';

/**
 * XR quality settings: uses the shared quality tier but overrides DPR and
 * disables shadows/postprocessing for XR performance.
 */
export function useXRQuality() {
  const { tier } = useQualityTier();

  return {
    level: tier.level,
    settings: {
      ...tier,
      dpr: XR_QUALITY.dpr,
      shadows: false,
      postProcessing: false,
    },
  };
}
