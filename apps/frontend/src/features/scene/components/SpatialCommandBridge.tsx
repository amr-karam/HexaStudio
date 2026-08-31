'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import gsap from 'gsap';
import { useSpatialStore, extractLightingPreset, extractMaterialPreset, parseCameraPayload } from '@/features/realtime/spatial-store';
import type { SpatialCommand } from '@/features/realtime/spatial-store';
import { useDesignerStore } from '@/features/scene/store/designer-store';
import { useCameraStore } from '@/features/scene/store/camera-store';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function showCommandToast(command: SpatialCommand): void {
  // Subtle feedback for AI-driven changes; no toast for user-originated to avoid noise
  if (command.metadata.triggeredBy !== 'ai-agent') return;
  const label =
    command.type === 'SET_LIGHTING'
      ? `Lighting → ${extractLightingPreset(command.payload) ?? 'updated'}`
      : command.type === 'SET_MATERIAL'
        ? `Material → ${extractMaterialPreset(command.payload) ?? 'updated'}`
        : 'Camera updated';
  toast.success(label, {
    description: command.metadata.agentPersona ? `by ${command.metadata.agentPersona}` : undefined,
    duration: 2500,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SpatialCommandBridge
 *
 * Subscribes to the global Zustand spatial store (populated by `useRealtime`
 * when a `spatial:command` arrives over the WebSocket) and applies each
 * command to the Three.js scene via the existing preset stores.
 *
 * - SET_LIGHTING  → `useDesignerStore.setLighting` (LIGHTING_PRESETS)
 * - SET_MATERIAL  → `useDesignerStore.setMaterial` (MATERIAL_PRESETS)
 * - SET_CAMERA    → GSAP camera animation or `useCameraStore.setTarget`
 *
 * Motion policy:
 * - When `staticMode` (prefers-reduced-motion or user-paused) is true, all
 *   camera transitions snap instantly; no GSAP is spawned and frameloop
 *   demand is already gated in ExperienceCanvas.
 * - Lighting/material switches are instant but still feel premium because the
 *   R3F lights/materials cross-fade via React's declarative update path.
 *
 * Must be rendered **inside** <Canvas> because it uses `useThree` for camera
 * access. It renders nothing (null) and owns its GSAP context lifecycle.
 */
export function SpatialCommandBridge(): null {
  const { camera } = useThree();
  const { staticMode } = useMotionPolicy();
  const lastCommand = useSpatialStore((s) => s.lastCommand);
  const setLighting = useDesignerStore((s) => s.setLighting);
  const setMaterial = useDesignerStore((s) => s.setMaterial);
  const setCameraTarget = useCameraStore((s) => s.setTarget);
  const setTransitioning = useCameraStore((s) => s.setTransitioning);

  const lastAppliedRef = useRef<SpatialCommand | null>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const lookProxyRef = useRef<Vector3 | null>(null);

  // Cleanup GSAP on unmount
  useEffect(() => {
    return () => {
      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;
    };
  }, []);

  const applyLighting = useCallback(
    (cmd: SpatialCommand) => {
      const preset = extractLightingPreset(cmd.payload);
      if (!preset) {
        console.warn('[SpatialCommandBridge] SET_LIGHTING missing valid preset', cmd.payload);
        return;
      }
      setLighting(preset);
      showCommandToast(cmd);
    },
    [setLighting],
  );

  const applyMaterial = useCallback(
    (cmd: SpatialCommand) => {
      const preset = extractMaterialPreset(cmd.payload);
      if (!preset) {
        console.warn('[SpatialCommandBridge] SET_MATERIAL missing valid preset', cmd.payload);
        return;
      }
      setMaterial(preset);
      showCommandToast(cmd);
    },
    [setMaterial],
  );

  const applyCamera = useCallback(
    (cmd: SpatialCommand) => {
      const { position, target, preset, fov } = parseCameraPayload(cmd.payload);

      // Preset path — delegate to camera store (handled by useCinematicCamera)
      if (preset && !position && !target) {
        setCameraTarget(preset);
        showCommandToast(cmd);
        return;
      }

      // Explicit position/target path
      if (!position && !target && !preset) {
        console.warn('[SpatialCommandBridge] SET_CAMERA missing position/target/preset', cmd.payload);
        return;
      }

      // FOV side-channel (PerspectiveCamera only)
      if (fov !== null && camera instanceof PerspectiveCamera) {
        if (staticMode) {
          camera.fov = fov;
          camera.updateProjectionMatrix();
        } else {
          gsap.to(camera, {
            fov,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => camera.updateProjectionMatrix(),
            overwrite: 'auto',
          });
        }
      }

      // Preset + position combo: set target first, then position will animate below
      if (preset) {
        setCameraTarget(preset);
      }

      // Kill any prior camera tween before starting a new one
      gsapCtxRef.current?.revert();
      lookProxyRef.current = null;

      const hasPosition = position !== null;
      const hasTarget = target !== null;

      if (staticMode) {
        // Snap instantly for reduced-motion / paused consumers
        if (hasPosition) camera.position.set(position[0], position[1], position[2]);
        if (hasTarget) camera.lookAt(new Vector3(target[0], target[1], target[2]));
        setTransitioning(false);
        showCommandToast(cmd);
        return;
      }

      // Cinematic path: GSAP
      setTransitioning(true);
      const ctx = gsap.context(() => {
        if (hasPosition) {
          gsap.to(camera.position, {
            x: position![0],
            y: position![1],
            z: position![2],
            duration: 1.8,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        }

        if (hasTarget) {
          // Animate a proxy vector and drive camera.lookAt onUpdate for smoothness
          const proxy = new Vector3().copy(camera.position).add(new Vector3(0, 0, -1));
          // Start from current look direction approximated by camera's world direction
          const dir = new Vector3();
          camera.getWorldDirection(dir);
          proxy.copy(camera.position).add(dir);
          lookProxyRef.current = new Vector3(target![0], target![1], target![2]);

          gsap.to(proxy, {
            x: target![0],
            y: target![1],
            z: target![2],
            duration: 1.8,
            ease: 'power3.out',
            overwrite: 'auto',
            onUpdate: () => {
              camera.lookAt(proxy);
            },
            onComplete: () => {
              setTransitioning(false);
            },
          });

          // If only target was provided (no position), ensure completion callback still fires
          if (!hasPosition) {
            // The tween above will handle completion
          }
        } else if (hasPosition) {
          // Position-only tween completion
          gsap.delayedCall(1.8, () => setTransitioning(false));
        }
      });
      gsapCtxRef.current = ctx;
      showCommandToast(cmd);
    },
    [camera, setCameraTarget, setTransitioning, staticMode],
  );

  useEffect(() => {
    if (!lastCommand) return;
    if (lastAppliedRef.current === lastCommand) return;
    lastAppliedRef.current = lastCommand;

    switch (lastCommand.type) {
      case 'SET_LIGHTING':
        applyLighting(lastCommand);
        break;
      case 'SET_MATERIAL':
        applyMaterial(lastCommand);
        break;
      case 'SET_CAMERA':
        applyCamera(lastCommand);
        break;
      default:
        break;
    }
  }, [lastCommand, applyLighting, applyMaterial, applyCamera]);

  return null;
}
