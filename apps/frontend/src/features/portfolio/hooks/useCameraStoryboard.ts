import { Vector3, Euler, MathUtils } from 'three';
import type { CameraStoryboard } from '@hexastudio/types';

export interface CameraStoryboardState {
  position: Vector3;
  target: Vector3;
  fov: number;
  rotation: Euler;
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
      position: new Vector3(0, 5, 10),
      target: new Vector3(0, 0, 0),
      fov: 50,
      rotation: new Euler(),
    };
  }

  // 1. Sort keyframes by progress
  const sorted = [...storyboard].sort((a, b) => a.progress - b.progress);

  // 2. Handle boundaries
  if (progress <= sorted[0].progress) {
    const first = sorted[0];
    return {
      position: new Vector3(...first.position),
      target: new Vector3(...first.target),
      fov: first.fov,
      rotation: new Euler(...(first.rotation || [0, 0, 0])),
    };
  }

  if (progress >= sorted[sorted.length - 1].progress) {
    const last = sorted[sorted.length - 1];
    return {
      position: new Vector3(...last.position),
      target: new Vector3(...last.target),
      fov: last.fov,
      rotation: new Euler(...(last.rotation || [0, 0, 0])),
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
    position: new Vector3().lerpVectors(
      new Vector3(...startKey.position),
      new Vector3(...endKey.position),
      t
    ),
    target: new Vector3().lerpVectors(
      new Vector3(...startKey.target),
      new Vector3(...endKey.target),
      t
    ),
    fov: MathUtils.lerp(startKey.fov, endKey.fov, t),
    rotation: new Euler().set(
      MathUtils.lerp(startKey.rotation?.[0] || 0, endKey.rotation?.[0] || 0, t),
      MathUtils.lerp(startKey.rotation?.[1] || 0, endKey.rotation?.[1] || 0, t),
      MathUtils.lerp(startKey.rotation?.[2] || 0, endKey.rotation?.[2] || 0, t)
    ),
  };
}
