'use client';

import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { QualityTier } from '@/providers/quality-provider';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

/* -------------------------------------------------------------------------- */
/*  Lazy-loaded scene — only imported when conditions are met                  */
/* -------------------------------------------------------------------------- */

const BlueprintHeroScene = lazy(
  () => import('./BlueprintHeroScene'),
);

/* -------------------------------------------------------------------------- */
/*  Static gold-poster — zero WebGL, instant render                            */
/*  Mirrors the gradient from BlueprintHeroScene.StaticPoster for consistency. */
/* -------------------------------------------------------------------------- */

function StaticGoldPoster() {
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
/*  Loading shell — branded shimmer that matches the HEXA luxury language      */
/* -------------------------------------------------------------------------- */

function ParticleLoadingShell() {
  return (
    <div className="absolute inset-0 -z-10 flex items-center justify-center bg-obsidian">
      <div className="flex flex-col items-center gap-6">
        <ShimmerSkeleton variant="circle" className="h-16 w-16" />
        <div className="flex flex-col items-center gap-3">
          <div className="h-[1px] w-12 bg-accent/40 animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
            Particles loading
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface LivingBlueprintHeroProps {
  /** The resolved quality tier (low / medium / high). */
  qualityTier: QualityTier;
  /** `true` when motion is suppressed (reduced‑motion OR user‑paused). */
  staticMode: boolean;
  /** `true` for mouse/trackpad; `false` for touch. */
  finePointer: boolean;
  /** `true` when animations are allowed to run. */
  animationsEnabled: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component — orchestrates the full loading ladder                           */
/* -------------------------------------------------------------------------- */

/**
 * LivingBlueprintHero — the front‑end integration orchestrator for the
 * Living Blueprint GPU particle engine (Sprint 15).
 *
 * ## Loading Ladder
 *
 * | Condition              | Behaviour                                          |
 * |------------------------|----------------------------------------------------|
 * | `staticMode`           | CSS gold gradient (no R3F loaded)                  |
 * | `qualityTier === low`  | CSS gold gradient (GPU too weak)                   |
 * | Load gate not met yet  | Invisible until IntersectionObserver or idle fires |
 * | Chunk downloading      | ShimmerSkeleton + branded loading text             |
 * | Runtime error          | SceneErrorBoundary fallback                        |
 * | Chunk ready            | BlueprintHeroScene (full R3F canvas)               |
 *
 * ## Lazy‑load gate
 *
 * The heavy Three.js / R3F / shader chunk loads ONLY when:
 *   - The hero section is in the viewport (IntersectionObserver) OR
 *   - The page has been idle for 2 s (`requestIdleCallback`)
 *
 * This keeps the critical path clear of ~180 KB of 3D bundles.
 */
export function LivingBlueprintHero({
  qualityTier,
  staticMode,
  finePointer: _finePointer,
  animationsEnabled,
}: LivingBlueprintHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // ── Load gate: IntersectionObserver + requestIdleCallback ─────────────
  useEffect(() => {
    // Already triggered — skip.
    if (shouldLoad) return;

    let idleId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const trigger = () => {
      setShouldLoad(true);
    };

    // Gate 1: hero enters viewport.
    const el = containerRef.current;
    if (el) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) trigger();
        },
        { rootMargin: '200px' }, // start loading 200 px before visible
      );
      observer.observe(el);
    }

    // Gate 2: idle after 2 s.
    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(trigger, { timeout: 2000 });
    } else {
      // Fallback for Safari / older browsers.
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

  // ── Determine rendering path ──────────────────────────────────────────

  // Path A: Static poster — no particles at all.
  const useStaticPoster =
    staticMode || qualityTier.level === 'low' || !animationsEnabled;

  if (useStaticPoster) {
    return (
      <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true">
        <StaticGoldPoster />
      </div>
    );
  }

  // Path B: Not ready to load yet — render an invisible placeholder so the
  // IntersectionObserver has a target, but don't show a loader (avoid
  // visual noise when the hero hasn't scrolled into view yet).
  if (!shouldLoad) {
    return (
      <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true" />
    );
  }

  // Path C: Load the full 3D scene.
  return (
    <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden="true">
      <SceneErrorBoundary
        title="Particle Engine Unavailable"
        description="The Living Blueprint particle system could not be loaded. Enjoy the static hero composition instead."
      >
        <Suspense fallback={<ParticleLoadingShell />}>
          <BlueprintHeroScene />
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
