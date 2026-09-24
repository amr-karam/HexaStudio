'use client';

import { Color, type Object3D, type MeshStandardMaterial } from 'three';
import type { MaterialOverride } from '../store/xr-store';

const _color = new Color();

/**
 * Live Atelier: applies AI/user material overrides to meshes in a Three.js
 * scene. Matching is exact, case-insensitive on mesh name or material name.
 * Mutates materials in place (needsUpdate) so React Three Fiber renders
 * without a page refresh.
 */
export function applyMaterialOverrides(
  scene: Object3D,
  overrides: MaterialOverride[],
): number {
  if (overrides.length === 0) return 0;
  let applied = 0;

  scene.traverse((obj) => {
    const mesh = obj as { name?: string; material?: MeshStandardMaterial; isMesh?: boolean };
    if (!mesh.isMesh || !mesh.material) return;
    const mat = mesh.material;
    const meshName = (mesh.name ?? '').toLowerCase();
    const matName = (mat.name ?? '').toLowerCase();

    for (const ov of overrides) {
      const key = ov.element.toLowerCase();
      if (meshName !== key && matName !== key) continue;

      if (ov.color) {
        _color.set(ov.color);
        mat.color.copy(_color);
      }
      if (typeof ov.roughness === 'number') mat.roughness = ov.roughness;
      if (typeof ov.metalness === 'number') mat.metalness = ov.metalness;
      if (ov.name) mat.name = ov.name;
      mat.needsUpdate = true;
      applied += 1;
    }
  });

  return applied;
}
