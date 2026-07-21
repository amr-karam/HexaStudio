'use client';

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';

import BlueprintParticles from './BlueprintParticles';
import { useQualityTier } from '@/providers/quality-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

const HeroBloom = lazy(() => import('./HeroBloom'));

/* -------------------------------------------------------------------------- */
/*  Static poster — the no-WebGL / low-tier / reduced-motion fallback          */
/* -------------------------------------------------------------------------- */

/**
 * A CSS rendition of the vortex: radial champagne glow on obsidian. Shown
 * whenever the simulation must not run (MOTION_SYSTEM.md: "Particle systems —
 * not rendered"). Content above remains fully functional.
 */
function StaticPoster() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(ellipse 65% 45% at 50% 42%, rgba(197,160,89,0.14) 0%, rgba(197,160,89,0.05) 40%, transparent 70%), #0A0A0A',
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  WebGL detection (same contract as ExperienceCanvas)                        */
/* -------------------------------------------------------------------------- */

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * BlueprintHeroScene (S15-FX-005) — the Living Blueprint hero canvas.
 *
 * Sits behind the HTML hero content (absolute, -z-10). Owns visibility
 * gating (IntersectionObserver + document visibility), WebGL detection,
 * and the fallback ladder:
 *
 *   no WebGL | low tier | reduced motion  →  StaticPoster (CSS only)
 *   paused                                →  canvas mounted, sim frozen
 *   medium tier                           →  16k particles, no bloom
 *   high tier                             →  65k particles + gold bloom
 */
export default function BlueprintHeroScene() {
  const { tier, ready } = useQualityTier();
  const { reducedMotion } = useMotionPolicy();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebglSupported(hasWebGL());
  }, []);

  // Pause when the hero scrolls offscreen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause when the tab is hidden.
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Fallback ladder: render the poster until we know we can do better.
  const useFallback =
    !mounted || !ready || !webglSupported || tier.level === 'low' || reducedMotion;

  if (useFallback) {
    return <StaticPoster />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, Math.min(tier.maxDpr, 1.5)]} // additive fill-rate cap
        gl={{
          antialias: false, // soft sprites need no AA; bloom smooths high tier
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#0A0A0A' }}
      >
        <Suspense fallback={null}>
          <BlueprintParticles visible={isVisible} />
          {/* Gold-tuned bloom — high tier only (S15-FX-006). */}
          {tier.level === 'high' && (
            <Suspense fallback={null}>
              <HeroBloom />
            </Suspense>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
