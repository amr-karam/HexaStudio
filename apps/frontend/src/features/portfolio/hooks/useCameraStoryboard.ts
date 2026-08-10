import * as THREE from 'three';
import type { CameraStoryboard } from '@hexastudio/types';

export interface CameraStoryboardState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  rotation: THREE.Euler;
}

/**
 * Interpolates camera properties based on a progress value (0-1).
 * This is a pure function intended to be called inside a render loop (e.g., useFrame).
 */
export function interpolateCameraStoryboard(
  progress: number,
  storyboard: CameraStoryboard
): CameraStoryboardState {
  if (!storyboard || storyboard.length === 0) {
    return {
      position: new THREE.Vector3(0, 5, 10),
      target: new THREE.Vector3(0, 0, 0),
      fov: 50,
      rotation: new THREE.Euler(),
    };
  }

  // 1. Sort keyframes by progress
  const sorted = [...storyboard].sort((a, b) => a.progress - b.progress);

  // 2. Handle boundaries
  if (progress <= sorted[0].progress) {
    const first = sorted[0];
    return {
      position: new THREE.Vector3(...first.position),
      target: new THREE.Vector3(...first.target),
      fov: first.fov,
      rotation: new THREE.Euler(...(first.rotation || [0, 0, 0])),
    };
  }

  if (progress >= sorted[sorted.length - 1].progress) {
    const last = sorted[sorted.length - 1];
    return {
      position: new THREE.Vector3(...last.position),
      target: new THREE.Vector3(...last.target),
      fov: last.fov,
      rotation: new THREE.Euler(...(last.rotation || [0, 0, 0])),
    };
  }

  // 3. Find interpolation range
  let startKey = sorted[0];
  let endKey = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (progress >= sorted[i].progress && progress <= sorted[i + 1].progress) {
      startKey = sorted[i];
      endKey = sorted[i + 1];
      break;
    }
  }

  // 4. Calculate local interpolation factor (0-1)
  const range = endKey.progress - startKey.progress;
  const t = range === 0 ? 0 : (progress - startKey.progress) / range;

  // 5. Interpolate
  return {
    position: new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...startKey.position),
      new THREE.Vector3(...endKey.position),
      t
    ),
    target: new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...startKey.target),
      new THREE.Vector3(...endKey.target),
      t
    ),
    fov: THREE.MathUtils.lerp(startKey.fov, endKey.fov, t),
    rotation: new THREE.Euler().set(
      THREE.MathUtils.lerp(startKey.rotation?.[0] || 0, endKey.rotation?.[0] || 0, t),
      THREE.MathUtils.lerp(startKey.rotation?.[1] || 0, endKey.rotation?.[1] || 0, t),
      THREE.MathUtils.lerp(startKey.rotation?.[2] || 0, endKey.rotation?.[2] || 0, t)
    ),
  };
}
