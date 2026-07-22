'use client';

import { useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import {
  createParticleSimulation,
  type ParticleSimulation,
  type SimulationParams,
  type RenderParams,
} from '../engine/ParticleSimulation';
import { HERO_VORTEX, type SplineFieldData } from '../engine/SplineField';
import { ForceField } from '../engine/ForceField';
import { useQualityTier } from '@/providers/quality-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

/* ========================================================================== */
/*  Types                                                                      */
/* ========================================================================== */

interface BlueprintParticlesProps {
  /** Spline field to flow particles along. Defaults to hero-vortex. */
  field?: SplineFieldData;
  /** Visibility gate — upstream IntersectionObserver + document visibility. */
  visible?: boolean;
  /** Override simulation physics parameters. */
  simOverrides?: Partial<SimulationParams>;
  /** Override rendering parameters. */
  renderOverrides?: Partial<RenderParams>;
}

/* ========================================================================== */
/*  Per‑tier overrides (tuned for visual density at each particle count)       */
/* ========================================================================== */

const SIM_OVERRIDES: Record<'medium' | 'high', Partial<SimulationParams>> = {
  medium: {
    curlStrength: 0.45,     // fewer particles → tamer curl to avoid sparse look
    cursorRadius: 1.4,
    cursorForce: 2.2,
  },
  high: {
    curlStrength: 0.65,
    cursorRadius: 1.8,
    cursorForce: 3.0,
  },
};

const RENDER_OVERRIDES: Record<'medium' | 'high', Partial<RenderParams>> = {
  medium: {
    pointSize: 48,          // fewer particles → larger sprites for coverage
    opacity: 0.62,
  },
  high: {
    pointSize: 36,
    opacity: 0.50,
  },
};

/* ========================================================================== */
/*  Static poster fallback — CSS gradient for reduced-motion mode              */
/* ========================================================================== */

/**
 * A CSS-only rendition of the champagne vortex on obsidian.
 *
 * Shown when `staticMode` is true. The parent layout (BlueprintHeroScene)
 * renders this as a sibling to the Canvas, not inside it — particles
 * components inside a Canvas cannot return raw HTML.
 *
 * The gradient mimics the cumulative additive glow of particles:
 * an elliptical radial at the hero center that fades smoothly to black.
 */
// Static poster style — defined here for reference; actual poster is rendered
// by the parent BlueprintHeroScene / LivingBlueprintHero orchestrator.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _POSTER_STYLE = {
  position: 'absolute' as const,
  inset: 0,
  pointerEvents: 'none' as const,
  zIndex: -10,
  background:
    'radial-gradient(ellipse 65% 45% at 50% 42%, ' +
    'rgba(197,160,89,0.14) 0%, ' +
    'rgba(197,160,89,0.05) 40%, ' +
    'transparent 70%), ' +
    '#0A0A0A',
};

/* ========================================================================== */
/*  Component: BlueprintParticles                                              */
/* ========================================================================== */

/**
 * BlueprintParticles (S15-FX-005) — R3F bridge that owns the GPGPU simulation
 * lifecycle, feeds per-frame cursor data, and renders the Points object.
 *
 * Rendering modes:
 * | Condition                 | Behaviour                                      |
 * |---------------------------|------------------------------------------------|
 * | staticMode (reduced/off)  | Returns null — parent renders CSS poster       |
 * | paused                    | Canvas mounted, sim frozen, Points still show  |
 * | low tier                  | Never created (parent renders CSS poster)      |
 * | medium tier               | 16k particles, no bloom                        |
 * | high tier                 | 65k particles + gold bloom (separate pass)     |
 *
 * Motion policy (from MOTION_SYSTEM.md):
 *  - `!animationsEnabled` → sim.update() is skipped; Particles freeze
 *  - `!finePointer`       → cursor force strength = 0; particles ignore mouse
 *  - `staticMode`         → component returns null; parent shows static poster
 */
export default function BlueprintParticles({
  field = HERO_VORTEX,
  visible = true,
  simOverrides,
  renderOverrides,
}: BlueprintParticlesProps) {
  const { tier, ready } = useQualityTier();
  const { animationsEnabled, finePointer, staticMode } = useMotionPolicy();
  const { gl: renderer, size: viewportSize, camera } = useThree();

  const tierKey = tier.level as 'medium' | 'high';

  /* -- Refs for mutable state (no re-render triggers) ---------------------- */
  const simRef = useRef<ParticleSimulation | null>(null);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);
  const mouseNDC = useRef(new THREE.Vector2(0, 0));
  const forceFieldRef = useRef<ForceField | null>(null);

  /* -- Stable tier key + overrides ----------------------------------------- */
  const mergedSimOverrides = useMemo(
    () => ({
      ...SIM_OVERRIDES[tierKey],
      ...simOverrides,
    }),
    [tierKey, simOverrides],
  );

  const mergedRenderOverrides = useMemo(
    () => ({
      ...RENDER_OVERRIDES[tierKey],
      ...renderOverrides,
    }),
    [tierKey, renderOverrides],
  );

  /* -- Create simulation (once per tier/field change) ---------------------- */
  const sim = useMemo(() => {
    return createParticleSimulation(
      tier.level,
      renderer,
      field,
      mergedSimOverrides,
      mergedRenderOverrides,
    );
  }, [tier.level, field, renderer, mergedSimOverrides, mergedRenderOverrides]);

  useLayoutEffect(() => {
    simRef.current = sim;
  }, [sim]);

  /* -- Update pixel ratio when viewport or DPR changes --------------------- */
  useEffect(() => {
    if (!sim) return;
    sim.setPixelRatio(Math.min(renderer.getPixelRatio(), tier.maxDpr));
  }, [sim, renderer, tier.maxDpr, viewportSize.width, viewportSize.height]);

  /* ======================================================================== */
  /*  Pointer tracking (window-level for transparent canvas interaction)       */
  /* ======================================================================== */

  useEffect(() => {
    if (!sim || !finePointer) {
      forceFieldRef.current = null;
      return;
    }

    const ff = new ForceField();
    forceFieldRef.current = ff;
    const el = renderer.domElement;

    const onMove = (e: PointerEvent) => ff.updateFromEvent(e, el);
    const onLeave = () => ff.deactivate();

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      ff.shutdown();
      forceFieldRef.current = null;
    };
  }, [sim, finePointer, renderer]);

  /* ======================================================================== */
  /*  Main render loop — requestAnimationFrame                                 */
  /* ======================================================================== */

  const animate = useCallback(
    (now: number) => {
      rafId.current = requestAnimationFrame(animate);

      if (!simRef.current) return;

      // Compute delta in seconds.
      const delta = lastTime.current === 0 ? 1 / 60 : (now - lastTime.current) / 1000;
      lastTime.current = now;

      // Skip update if animations are paused or component is hidden.
      if (!animationsEnabled || !visible) return;

      // Use ForceField for cursor interaction when available.
      const ff = forceFieldRef.current;
      if (ff) {
        const { world, strength } = ff.step(camera, delta);
        simRef.current.setCursor(world, strength);
      } else {
        // Fallback: direct NDC update (no cursor force when ForceField is off).
        simRef.current.update(delta, mouseNDC.current, tier.level);
      }
    },
    [animationsEnabled, visible, tier.level, camera],
  );

  useEffect(() => {
    // Start the rAF loop.
    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      lastTime.current = 0;
    };
  }, [animate]);

  useEffect(() => {
    if (!sim) return;
    sim.bindContextRecovery(renderer.domElement);
    return () => {
      sim.unbindContextRecovery(renderer.domElement);
      sim.dispose();
    };
  }, [sim, renderer]);

  /* ======================================================================== */
  /*  Render gating                                                            */
  /* ======================================================================== */

  // Static mode: component renders nothing. The parent (BlueprintHeroScene)
  // renders a CSS gradient poster outside the Canvas.
  if (staticMode) {
    return null;
  }

  // Not ready or no simulation (low tier) → nothing to render.
  if (!ready || !sim) {
    return null;
  }

  // Render the Points object via R3F's primitive. The simulation
  // continuously updates the position/velocity textures bound to
  // the Points material — no per-frame prop changes needed.
  return <primitive object={sim.points} />;
}
