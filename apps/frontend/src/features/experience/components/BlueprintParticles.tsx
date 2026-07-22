'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

import {
  createParticleSimulation,
  ParticleSimulation,
  type SimulationParams,
  type RenderParams,
} from '../engine/ParticleSimulation';
import { ForceField } from '../engine/ForceField';
import { HERO_VORTEX, type SplineFieldData } from '../engine/SplineField';
import { useQualityTier } from '@/providers/quality-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { EASE, DURATION } from '@/lib/motion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Props {
  /** Spline field to flow particles along. */
  field?: SplineFieldData;
  /** Visibility gate — upstream IntersectionObserver + document visibility. */
  visible?: boolean;
  /** Override defaults for sim physics. */
  simOverrides?: Partial<SimulationParams>;
  /** Override defaults for rendering. */
  renderOverrides?: Partial<RenderParams>;
}

/**
 * Per-tier simulation parameter overrides sourced from the motion library
 * for consistent feel across the experience.
 */
const SIM_OVERRIDES: Record<'medium' | 'high', Partial<SimulationParams>> = {
  medium: {
    curlStrength: 0.45,    // fewer particles → tamer curl to avoid sparse look
    pointerRadius: 1.4,
    pointerForce: 2.2,
  },
  high: {
    curlStrength: 0.65,
    pointerRadius: 1.8,
    pointerForce: 3.0,
  },
};

const RENDER_OVERRIDES: Record<'medium' | 'high', Partial<RenderParams>> = {
  medium: {
    pointSize: 48,   // fewer particles → slightly larger to maintain density
    opacity: 0.62,
  },
  high: {
    pointSize: 36,
    opacity: 0.50,
  },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * BlueprintParticles (S15-FX-005) — R3F bridge that owns the GPGPU simulation
 * lifecycle and feeds per-frame cursor data through the ForceField.
 *
 * Motion policy gates (from MOTION_SYSTEM.md):
 *  - `reducedMotion` / `paused` → step() is not called; scene freezes in place
 *     but renderer keeps painting the last texture contents
 *  - `!finePointer`    → force field strength stays 0 (no cursor interaction)
 *  - `low` tier        → parent renders the CSS poster instead; this component
 *     never receives `!low` due to the guard in BlueprintHeroScene
 */
export default function BlueprintParticles({
  field = HERO_VORTEX,
  visible = true,
  simOverrides,
  renderOverrides,
}: Props) {
  const { tier } = useQualityTier();
  const { animationsEnabled, finePointer } = useMotionPolicy();
  const { gl, camera, size: viewportSize } = useThree();

  const tierKey = tier.level as 'medium' | 'high';

  // ── Simulation (lazy-init on first render, recreated on tier/field change) ─
  const sim = useMemo(() => {
    const mergedSimOverrides = { ...SIM_OVERRIDES[tierKey], ...simOverrides };
    const mergedRenderOverrides = { ...RENDER_OVERRIDES[tierKey], ...renderOverrides };
    return createParticleSimulation(
      tier.level,
      field,
      mergedSimOverrides,
      mergedRenderOverrides,
    );
  }, [field, tier.level, simOverrides, renderOverrides, tierKey]);

  // ── Force field — one instance, reset on mount ───────────────────────────
  const forceField = useMemo(() => new ForceField(), []);

  // ── Disposal — anti-leak protocol ───────────────────────────────────────
  useEffect(() => {
    return () => {
      sim?.dispose();
      forceField.shutdown();
    };
  }, [sim, forceField]);

  // ── Context-lost recovery ───────────────────────────────────────────────
  useEffect(() => {
    if (!sim) return;
    sim.bindContextRecovery(gl.domElement);
    return () => sim.unbindContextRecovery(gl.domElement);
  }, [sim, gl]);

  // ── Pointer listeners (fine-pointer only) ───────────────────────────────
  useEffect(() => {
    if (!sim || !finePointer) return;

    const el = gl.domElement;

    const onMove = (e: PointerEvent) => {
      forceField.updateFromEvent(e, el);
    };
    const onLeave = () => {
      forceField.deactivate();
    };

    // Listen on window so the force field reacts even when cursor is over
    // the headline HTML that sits above the canvas (transparent interaction).
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [sim, finePointer, gl, forceField]);

  // ── Frame loop ──────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!sim) return;

    // Motion policy gate: freeze when paused or under reduced motion.
    if (!animationsEnabled || !visible) return;

    // Step the force field (NDC → world space, velocity → strength).
    const { world, strength } = forceField.step(camera, delta);
    sim.setPointer(world, finePointer ? strength : 0);

    // Advance the GPU simulation.
    const pixelRatio = Math.min(state.gl.getPixelRatio(), tier.maxDpr);
    sim.update(delta, state.gl, pixelRatio);
  });

  // Keep in R3F's resize loop so uPixelRatio stays accurate.
  void viewportSize;

  if (!sim) return null;

  return <primitive object={sim.points} />;
}
