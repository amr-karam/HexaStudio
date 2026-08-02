'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Object3D, Mesh, MeshPhysicalMaterial, AnimationMixer, AnimationAction, LoopRepeat } from 'three';
import gsap from 'gsap';
import { useAssetLoader } from '@/features/scene/hooks/useAssetLoader';
import { useCameraStore } from '../store/camera-store';
import { useQualityTier, QualityLevel } from '@/providers/quality-provider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MATERIAL_PRESETS, MaterialPresetConfig } from '../config/material-presets';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ROTATION_SPEED = 0.15; // radians per second (delta-based)
const MAX_DELTA = 0.1;
const ENTRANCE_DURATION = 1.5;
const ENTRANCE_DELAY = 0.2;
const ENTRANCE_ROTATION = Math.PI * 0.2;

/** Distance thresholds for LOD material adjustments. */
const LOD_FAR = 20;
const LOD_MID = 10;

/* -------------------------------------------------------------------------- */
/*  LOD factors — layered on top of the designer material preset               */
/* -------------------------------------------------------------------------- */

/**
 * Quality/distance multipliers applied to the active material preset
 * (color + metalness stay fixed; surface response degrades with distance).
 * Lower tiers sacrifice reflections/clearcoat fidelity and raise roughness to
 * hide LOD pop-in, while high tier preserves the full preset appearance.
 */
interface LODFactors {
  clearcoat: number;
  roughness: number;
  envMapIntensity: number;
}

const LOD_FACTORS: Record<QualityLevel, LODFactors> = {
  low: { clearcoat: 0, roughness: 1.8, envMapIntensity: 0.4 },
  medium: { clearcoat: 0.5, roughness: 1.2, envMapIntensity: 0.8 },
  high: { clearcoat: 1, roughness: 1, envMapIntensity: 1.1 },
};

/** Distance fallbacks (applied when the camera pulls back). */
const FAR_FACTORS: LODFactors = { clearcoat: 0, roughness: 1.8, envMapIntensity: 0.3 };
const MID_FACTORS: LODFactors = { clearcoat: 0.4, roughness: 1.4, envMapIntensity: 0.6 };

/**
 * Applies the designer material preset to a physical material, scaled by the
 * active LOD factors. `color` and `metalness` are preset-fixed; the surface
 * response fields blend preset base values with the LOD multipliers.
 */
function applyLODMaterial(
  material: MeshPhysicalMaterial,
  preset: MaterialPresetConfig,
  factors: LODFactors,
): void {
  material.color.set(preset.color);
  material.metalness = preset.metalness;
  material.roughness = Math.min(1, Math.max(0, preset.roughness * factors.roughness));
  material.clearcoat = Math.min(1, Math.max(0, preset.clearcoat * factors.clearcoat));
  material.envMapIntensity = preset.envMapIntensity * factors.envMapIntensity;
  material.needsUpdate = true;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface ModelProps {
  url: string;
  position?: [number, number, number];
  scale?: number;
  paused?: boolean;
  /** Designer-mode material preset; falls back to obsidian marble. */
  materialPreset?: MaterialPresetConfig;
}

/**
 * ArchitecturalModel loads and displays a 3D project model with Draco compression.
 *
 * Key design decisions:
 * 1. Cache-immutable: we do NOT dispose resources from `useGLTF` on unmount.
 *    Drei's internal cache manages GPU resource lifecycle.
 * 2. Entrance animation is separated from quality-level changes.
 * 3. Single transform layer: scale is applied to the group, NOT the primitive.
 * 4. All per-frame rotation uses delta time.
 * 5. Reduced motion: immediate final state, no entrance animation.
 */
export const ArchitecturalModel = ({ url, position = [0, 0, 0], scale = 1, paused = false, materialPreset }: ModelProps) => {
  const { model, animations } = useAssetLoader(url);
  const groupRef = useRef<Group>(null);
  const { isTransitioning } = useCameraStore();
  const { tier } = useQualityTier();
  const { level } = tier;
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();
  const lastDistanceRef = useRef(0);
  const ctxRef = useRef<gsap.Context | null>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  // Designer material preset — falls back to the default surface when used
  // standalone (outside SceneContent). Identity-stable record reference.
  const preset = materialPreset ?? MATERIAL_PRESETS.obsidian_marble;

  // ─── AnimationMixer setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!model || !animations.length || reducedMotion) return;

    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    // Play the first clip by default (loop).
    const clip = animations[0];
    const action = mixer.clipAction(clip);
    action.setLoop(LoopRepeat, Infinity); // LoopRepeat
    action.play();
    actionRef.current = action;

    return () => {
      action.stop();
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [model, animations, reducedMotion]);

  // Kill GSAP entrance tweens on cleanup.
  useEffect(() => {
    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  // ─── Cinematic Entrance Animation (separate from quality changes) ────────
  useEffect(() => {
    if (!model || !groupRef.current) return;

    // Clean up any previous entrance tweens.
    ctxRef.current?.revert();

    if (reducedMotion) {
      // Snap to final state instantly.
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.y = 0;
      return;
    }

    // Set initial state.
    groupRef.current.scale.set(0, 0, 0);

    const ctx = gsap.context(() => {
      gsap.to(groupRef.current!.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: ENTRANCE_DURATION,
        ease: 'power4.out',
        delay: ENTRANCE_DELAY,
      });

      gsap.from(groupRef.current!.rotation, {
        y: ENTRANCE_ROTATION,
        duration: 2,
        ease: 'power2.out',
      });
    });

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
  }, [model, scale, reducedMotion]); // NOT level — quality changes don't re-trigger entrance

  // ─── Designer material preset + quality-based LOD adjustments ──────────
  // Preset switches and quality changes both re-apply the surface response.
  // The distance guard is reset so the per-frame pass re-evaluates instantly
  // after a change instead of waiting for the camera to move.
  useEffect(() => {
    if (!model) return;

    const factors = LOD_FACTORS[level];
    lastDistanceRef.current = 0;
    model.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.material instanceof MeshPhysicalMaterial) {
        applyLODMaterial(child.material, preset, factors);
      }
    });
  }, [model, level, preset]);

  // ─── Per-frame rotation (delta-based) + distance LOD + mixer update ─────
  useFrame((_, delta) => {
    if (!groupRef.current || isTransitioning || !model || paused) return;

    const dt = Math.min(delta, MAX_DELTA);

    // Update animation mixer.
    if (mixerRef.current && !reducedMotion) {
      mixerRef.current.update(dt);
    }

    // Rotation: delta-based, skip under reduced motion.
    if (!reducedMotion) {
      groupRef.current.rotation.y += dt * ROTATION_SPEED;
    }

    // Distance-based LOD: adjust material complexity based on camera distance.
    const distance = camera.position.distanceTo(groupRef.current.position);
    if (Math.abs(distance - lastDistanceRef.current) < 2) return; // Avoid frequent updates.
    lastDistanceRef.current = distance;

    const factors = distance > LOD_FAR
      ? FAR_FACTORS
      : distance > LOD_MID
        ? MID_FACTORS
        : LOD_FACTORS[level];

    model.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.material instanceof MeshPhysicalMaterial) {
        applyLODMaterial(child.material, preset, factors);
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Scale is applied ONLY to the group — single transform layer. */}
      <primitive object={model} />
    </group>
  );
};
