'use client';

import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, SMAA } from '@react-three/postprocessing';
import { QualityLevel } from '@/hooks/useAdaptiveQuality';

interface PostProcessingProps {
  quality: QualityLevel;
}

/**
 * PostProcessing manages the cinematic visual stack.
 * It implements a high-end architectural render style:
 * sharp focus, selective bloom, subtle film grain, and soft anti-aliasing.
 */
export const PostProcessing = ({ quality }: PostProcessingProps) => {
  if (quality === 'low') return null;

  return (
    <EffectComposer enableNormalPass={false}>
      <>
        {/* SMAA anti-aliasing for crisp architectural edges on medium+. */}
        <SMAA />

        {/* Selective, soft bloom — only the brightest gold/emissive accents glow. */}
        <Bloom
          intensity={quality === 'high' ? 0.4 : 0.25}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.2}
          radius={0.4}
        />

        {/* Targeted depth of field for a cinematic focal plane (high only). */}
        {quality === 'high' && (
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.025}
            bokehScale={3}
          />
        )}

        {/* Subtle film grain — barely perceptible organic texture. */}
        <Noise opacity={quality === 'high' ? 0.02 : 0.015} />

        {/* Soft vignette — gentle falloff, not aggressive. */}
        <Vignette offset={0.3} darkness={0.8} />
      </>
    </EffectComposer>
  );
};
