'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Object3D, Mesh, MeshPhysicalMaterial, AnimationMixer, AnimationAction, LoopRepeat } from 'three';
import gsap from 'gsap';
import { useAssetLoader } from '@/features/scene/hooks/useAssetLoader';
import { useCameraStore } from '../store/camera-store';
import { useQualityTier, QualityLevel } from '@/providers/quality-provider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
/*  Material presets per quality level                                         */
/* -------------------------------------------------------------------------- */

interface MaterialPreset {
  clearcoat: number;
  roughness: number;
  envMapIntensity: number;
}

const LOD_PRESETS: Record<QualityLevel, MaterialPreset> = {
  low: { clearcoat: 0, roughness: 0.5, envMapIntensity: 0.5 },
  medium: { clearcoat: 0.5, roughness: 0.3, envMapIntensity: 1.0 },
  high: { clearcoat: 1, roughness: 0.1, envMapIntensity: 1.5 },
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface ModelProps {
  url: string;
  position?: [number, number, number];
  scale?: number;
  paused?: boolean;
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
export const ArchitecturalModel = ({ url, position = [0, 0, 0], scale = 1, paused = false }: ModelProps) => {
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

  // ─── Quality-based material adjustments (no disposal) ───────────────────
  useEffect(() => {
    if (!model) return;

    const preset = LOD_PRESETS[level];
    model.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.material instanceof MeshPhysicalMaterial) {
        child.material.clearcoat = preset.clearcoat;
        child.material.roughness = preset.roughness;
        child.material.envMapIntensity = preset.envMapIntensity;
      }
    });
  }, [model, level]);

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

    const farPreset = LOD_PRESETS.low;
    const midPreset = LOD_PRESETS.medium;
    const closePreset = LOD_PRESETS[level];

    const preset = distance > LOD_FAR
      ? farPreset
      : distance > LOD_MID
        ? midPreset
        : closePreset;

    model.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.material instanceof MeshPhysicalMaterial) {
        const mat = child.material;
        mat.clearcoat = preset.clearcoat;
        mat.roughness = preset.roughness;
        mat.envMapIntensity = preset.envMapIntensity;
        mat.needsUpdate = true;
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
