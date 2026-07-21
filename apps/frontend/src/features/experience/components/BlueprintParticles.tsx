'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';

import { ParticleSimulation } from '../engine/ParticleSimulation';
import { HERO_VORTEX, type SplineFieldData } from '../engine/SplineField';
import { useQualityTier } from '@/providers/quality-provider';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Props {
  field?: SplineFieldData;
  /** External visibility gate (IntersectionObserver upstream). */
  visible?: boolean;
}

/** Simulation texture edge per quality tier (particles = size²). */
const SIM_SIZE: Record<'low' | 'medium' | 'high', number> = {
  low: 0, // low tier never mounts this component; guard anyway
  medium: 128, // 16,384 particles
  high: 256, // 65,536 particles
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * BlueprintParticles — mounts the GPGPU simulation inside an R3F canvas.
 *
 * Policy gates (MOTION_SYSTEM.md matrices):
 * - reduced motion / pause: step() is not called — field freezes in place
 * - coarse pointer: force field strength stays 0
 * - low tier: parent renders the static poster instead of the canvas
 */
export default function BlueprintParticles({ field = HERO_VORTEX, visible = true }: Props) {
  const { tier } = useQualityTier();
  const { animationsEnabled, finePointer } = useMotionPolicy();
  const { gl, camera, size: viewportSize } = useThree();

  const simSize = SIM_SIZE[tier.level];

  const sim = useMemo(() => {
    if (simSize === 0) return null;
    return new ParticleSimulation({
      size: simSize,
      field,
      pointSize: tier.level === 'high' ? 36 : 44, // fewer particles → slightly larger
      opacity: tier.level === 'high' ? 0.5 : 0.62,
    });
    // Recreate only when tier or field actually changes.
  }, [simSize, field, tier.level]);

  // Disposal — anti-leak protocol.
  useEffect(() => {
    return () => {
      sim?.dispose();
    };
  }, [sim]);

  /* ---- Pointer → world-space force field (S15-FX-004) -------------------- */

  const pointerState = useRef({
    ndc: new Vector2(),
    raycaster: new Raycaster(),
    plane: new Plane(new Vector3(0, 0, 1), 0), // z = 0 world plane
    world: new Vector3(),
    active: false,
  });

  useEffect(() => {
    // Coarse pointers never receive the force field.
    if (!finePointer || !sim) return;

    const el = gl.domElement;
    const state = pointerState.current;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      state.ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      state.active = true;
    };
    const onLeave = () => {
      state.active = false;
    };

    // The hero canvas sits behind HTML content, so listen on window: the
    // force field should react even when the cursor is over the headline.
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [finePointer, sim, gl]);

  /* ---- Frame loop --------------------------------------------------------- */

  useFrame((state, delta) => {
    if (!sim) return;
    // Freeze contract: no step() under pause/reduced motion or offscreen.
    if (!animationsEnabled || !visible) return;

    const ps = pointerState.current;
    if (finePointer && ps.active) {
      ps.raycaster.setFromCamera(ps.ndc, camera);
      const hit = ps.raycaster.ray.intersectPlane(ps.plane, ps.world);
      sim.setPointer(hit ?? ps.world, hit ? 2.4 : 0);
    } else {
      sim.setPointer(sim.pointerTarget, 0);
    }

    sim.step(state.gl, delta, Math.min(state.gl.getPixelRatio(), 2));
  });

  // Keep an eye on resize: nothing to do — point sizing derives from
  // uPixelRatio and perspective, but reference viewportSize so R3F keeps
  // this component in the resize update path.
  void viewportSize;

  if (!sim) return null;

  return <primitive object={sim.points} />;
}
