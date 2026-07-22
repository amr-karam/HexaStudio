'use client';

import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useQualityTier } from '@/providers/quality-provider';

/* ========================================================================== */
/*  Per‑tier gold bloom configuration                                          */
/* ========================================================================== */

interface BloomConfig {
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  radius: number;
}

/**
 * Gold-tuned bloom parameters (S15-FX-006).
 *
 * The champagne-gold particles (#C5A059) emit luminance in the 0.7–0.95
 * range. By setting the threshold to 0.7 we ensure:
 *  - Hot particle cores (high-energy, near-white) bloom into a soft gold aura
 *  - Cool champagne surfaces (luminance < 0.7) do NOT bloom
 *  - The result is a clean, laser‑etch look with a warm ethereal glow
 *
 * Medium tier never mounts this component (see condition in render),
 * but the config is provided for completeness.
 */
const BLOOM_CONFIG: Record<string, BloomConfig> = {
  high: {
    intensity: 0.85,
    luminanceThreshold: 0.7,
    luminanceSmoothing: 0.3,
    radius: 0.6,
  },
  medium: {
    intensity: 0.5,
    luminanceThreshold: 0.75,
    luminanceSmoothing: 0.2,
    radius: 0.5,
  },
};

/* ========================================================================== */
/*  Component: HeroBloom                                                       */
/* ========================================================================== */

/**
 * HeroBloom (S15-FX-006) — gold‑tuned UnrealBloomPass for the Living Blueprint.
 *
 * Wraps @react-three/postprocessing's Bloom effect, tuned specifically for
 * champagne‑gold particle sprites on an obsidian (#0A0A0A) background.
 *
 * Rendering policy:
 * | Tier   | Behaviour                                              |
 * |--------|--------------------------------------------------------|
 * | high   | Bloom enabled: threshold 0.7, intensity 0.85          |
 * | medium | Returns null — bloom skipped to preserve fill-rate    |
 * | low    | Component never mounted (parent renders static poster)|
 *
 * The EffectComposer uses `enableNormalPass={false}` to avoid double‑sampling
 * the scene when bloom is the only post‑processing effect. This saves ~1 full
 * render pass per frame.
 */
export default function HeroBloom() {
  const { tier, ready } = useQualityTier();

  // Don't render until quality detection is complete.
  if (!ready) return null;

  // Bloom is a high-tier-only luxury. Medium/low tiers skip it entirely
  // to preserve GPU fill-rate for the core particle simulation.
  if (tier.level !== 'high') return null;

  const config = BLOOM_CONFIG.high;

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={config.intensity}
        luminanceThreshold={config.luminanceThreshold}
        luminanceSmoothing={config.luminanceSmoothing}
        radius={config.radius}
        mipmapBlur
      />
    </EffectComposer>
  );
}
