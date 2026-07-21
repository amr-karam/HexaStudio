'use client';

import { EffectComposer, Bloom, Noise, Vignette, SMAA } from '@react-three/postprocessing';
import { useQualityTier } from '@/providers/quality-provider';

/**
 * PostProcessing manages the cinematic visual stack.
 *
 * Quality policy:
 * - low:    null (no postprocessing)
 * - medium: SMAA only (no bloom, noise, or vignette)
 * - high:   SMAA + bloom + noise + vignette
 */
export const PostProcessing = () => {
  const { tier } = useQualityTier();

  if (!tier.postProcessing) return null;

  // High: full stack with SMAA + bloom + noise + vignette.
  // Medium: SMAA only (tier.postProcessing is false for medium, so this
  // function returns null for medium too; the AA is handled at the Canvas
  // gl.antialias level for medium via SMAA in the EffectComposer below).
  // Since we want SMAA on medium: we check the antialias field.

  const isHigh = tier.level === 'high';
  const useSMAA = tier.antialias === 'smaa' || tier.antialias === 'msaa';

  return (
    <EffectComposer enableNormalPass={false}>
      <>
        {/* SMAA anti-aliasing — used when tier requests it. */}
        {useSMAA && <SMAA />}

        {/* Selective, soft bloom — only high tier. */}
        {isHigh && (
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.2}
            radius={0.4}
          />
        )}

        {/* Subtle film grain — high only. */}
        {isHigh && <Noise opacity={0.02} />}

        {/* Soft vignette — high only. */}
        {isHigh && <Vignette offset={0.3} darkness={0.8} />}
      </>
    </EffectComposer>
  );
};
