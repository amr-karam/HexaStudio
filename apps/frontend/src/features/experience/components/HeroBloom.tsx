'use client';

import { EffectComposer, Bloom } from '@react-three/postprocessing';

/* -------------------------------------------------------------------------- */
/*  Per‑tier gold bloom configuration                                          */
/* -------------------------------------------------------------------------- */

interface BloomConfig {
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  radius: number;
}

/**
 * Gold-tuned bloom parameters (S15-FX-006).
 *
 * The gold particles emit luminance in the 0.7–0.95 range — the threshold
 * is set just below their typical brightness so their "hot cores" bloom but
 * the surrounding champagne haze does not. This yields a clean, laser‑etch
 * look while high‑energy particles spill a soft golden aura.
 *
 * Medium tier never mounts this component (see BlueprintHeroScene), but
 * the config is provided for completeness if the tier gating changes.
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

interface Props {
  /** Quality tier override — defaults to 'high'. */
  tier?: string;
}

/**
 * HeroBloom — a thin wrapper around @react-three/postprocessing's Bloom effect
 * tuned specifically for gold-on-obsidian particle sprites.
 *
 * Lazy-loaded and conditionally rendered in BlueprintHeroScene for the high
 * tier only, keeping the postprocessing bundle off the critical path for
 * medium/low users.
 */
export default function HeroBloom({ tier: overrideTier }: Props) {
  const config = BLOOM_CONFIG[overrideTier ?? 'high'] ?? BLOOM_CONFIG.high;

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
