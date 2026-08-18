
"use client";

import { useQualityTier } from "@/providers/quality-provider";
import { useMotionPolicy } from "@/hooks/useMotionPolicy";
import { useFinePointer } from "@/hooks/useFinePointer";
import { FractureRingHero } from "@/features/experience/components/FractureRingHero";

/**
 * HomeHero — Orchestrator for the CH. I VISION hero section.
 * 
 * Wraps the 3D FractureRingHero and provides the necessary
 * environmental and quality context.
 */
export function HomeHero() {
  const { tier } = useQualityTier();
  const { staticMode, animationsEnabled } = useMotionPolicy();
  const finePointer = useFinePointer();

  return (
    <FractureRingHero 
      qualityTier={tier}
      staticMode={staticMode}
      finePointer={finePointer}
      animationsEnabled={animationsEnabled}
    />
  );
}

