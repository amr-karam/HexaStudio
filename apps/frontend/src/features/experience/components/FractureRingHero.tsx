'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { MotionValue } from 'framer-motion';
import type { QualityTier } from '@/providers/quality-provider';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

const FractureRingScene = lazy(() =>
  import('./FractureRingScene').then((m) => ({ default: m.FractureRingScene })),
);

function StaticFracturePoster() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(ellipse 65% 45% at 50% 42%, rgba(255, 77, 0, 0.10) 0%, rgba(255, 77, 0, 0.04) 40%, transparent 70%), #0A0A0A',
      }}
    />
  );
}

function FractureLoadingShell() {
  return (
    <div className="absolute inset-0 -z-10 flex items-center justify-center bg-obsidian">
      <div className="flex flex-col items-center gap-6">
        <ShimmerSkeleton variant="circle" className="h-16 w-16" />
        <div className="flex flex-col items-center gap-3">
          <div className="h-[1px] w-12 bg-accent/40 animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
            Fracture ring loading
          </span>
        </div>
      </div>
    </div>
  );
}

interface FractureRingHeroProps {
  qualityTier: QualityTier;
  staticMode: boolean;
  finePointer: boolean;
  animationsEnabled: boolean;
  scrollProgress?: MotionValue<number>;
}

/**
 * FractureRingHero — CH. I VISION hero object.
 *
 * Decoded from the user's CodePen reference (Fracture Ring): a dark torus
 * with a barycentric wireframe core, fractured stone shell, bloom, and
 * scroll-driven rotation. This orchestrator handles the same quality/load
 * gates as LivingBlueprintHero.
 */
export function FractureRingHero({
  qualityTier,
  staticMode,
  finePointer,
  animationsEnabled,
  scrollProgress,
}: FractureRingHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    let idleId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const trigger = () => setShouldLoad(true);
    const el = containerRef.current;
    if (el) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) trigger();
      }, { rootMargin: '200px' });
      observer.observe(el);
    }

    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(trigger, { timeout: 2000 });
    } else {
      const timer = setTimeout(trigger, 2000);
      idleId = timer as unknown as number;
    }

    return () => {
      observer?.disconnect();
      if (idleId !== undefined) {
        if (typeof cancelIdleCallback !== 'undefined') {
          cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId);
        }
      }
    };
  }, [shouldLoad]);

  const useStaticPoster =
    staticMode || qualityTier.level === 'low' || !animationsEnabled;

  if (useStaticPoster) {
    return (
      <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true">
        <StaticFracturePoster />
      </div>
    );
  }

  if (!shouldLoad) {
    return (
      <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true" />
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true">
      <SceneErrorBoundary
        title="Fracture Engine Unavailable"
        description="The fracture ring WebGL scene could not be loaded. Enjoy the static hero composition instead."
      >
        <Suspense fallback={<FractureLoadingShell />}>
          <FractureRingScene scrollProgress={scrollProgress} finePointer={finePointer} />
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
