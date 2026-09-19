'use client';

import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

interface PostProcessingProps {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  vignetteIntensity?: number;
  noiseOpacity?: number;
  enabled?: boolean;
}

/**
 * PostProcessingCinematic — Cinematic post-processing pipeline
 * with bloom, vignette, and film grain.
 *
 * Tuned for the HEXA Silent Luxury aesthetic:
 * - Subtle bloom for gold highlights
 * - Vignette for cinematic framing
 * - Film grain for texture
 */
function PostProcessingEffects({
  bloomIntensity = 0.4,
  bloomThreshold = 0.6,
  bloomSmoothing = 0.9,
  vignetteIntensity = 0.45,
  noiseOpacity = 0.04,
  enabled = true,
}: PostProcessingProps) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={vignetteIntensity}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={noiseOpacity}
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
      />
    </EffectComposer>
  );
}

export { PostProcessingEffects as PostProcessing };
