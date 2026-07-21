'use client';

import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * HeroBloom (S15-FX-006) — bloom tuned for gold-on-obsidian.
 *
 * Lower threshold than the scene stack (0.7 vs 0.85): particle sprites are
 * dim individually and only their high-energy cores should glow. Lazy-loaded
 * and mounted on the high tier only, so medium/low never pay for the
 * postprocessing chunk.
 */
export default function HeroBloom() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.3}
        radius={0.6}
        mipmapBlur
      />
    </EffectComposer>
  );
}
