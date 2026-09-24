import { describe, it, expect } from 'vitest';
import { Scene, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { applyMaterialOverrides } from '@/features/xr/utils/apply-material-overrides';
import type { MaterialOverride } from '@/features/xr/store/xr-store';

function makeOverride(partial: Partial<MaterialOverride> = {}): MaterialOverride {
  return {
    element: 'unnamed',
    triggeredBy: 'ai-agent',
    timestamp: 0,
    ...partial,
  };
}

function makeMesh(name: string, materialName?: string): Mesh {
  const material = new MeshStandardMaterial();
  if (materialName) material.name = materialName;
  const mesh = new Mesh(new BoxGeometry(1, 1, 1), material);
  mesh.name = name;
  return mesh;
}

describe('applyMaterialOverrides', () => {
  it('returns 0 and leaves materials untouched when overrides are empty', () => {
    const scene = new Scene();
    const mesh = makeMesh('wall');
    scene.add(mesh);

    const applied = applyMaterialOverrides(scene, []);

    expect(applied).toBe(0);
    expect((mesh.material as MeshStandardMaterial).color.getHexString()).toBe('ffffff');
    expect((mesh.material as MeshStandardMaterial).version).toBe(0);
  });

  it('applies color, roughness and metalness matched by mesh name (case-insensitive)', () => {
    const scene = new Scene();
    const mesh = makeMesh('Marble_Wall');
    scene.add(mesh);

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'marble_wall', color: '#d4af37', roughness: 0.15, metalness: 0.9 }),
    ]);

    const mat = mesh.material as MeshStandardMaterial;
    expect(applied).toBe(1);
    expect(mat.color.getHexString()).toBe('d4af37');
    expect(mat.roughness).toBe(0.15);
    expect(mat.metalness).toBe(0.9);
    expect(mat.version).toBeGreaterThan(0);
  });

  it('matches by material name when the mesh name differs', () => {
    const scene = new Scene();
    const mesh = makeMesh('facade_panel', 'Brushed_Titanium');
    scene.add(mesh);

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'brushed_titanium', roughness: 0.4 }),
    ]);

    expect(applied).toBe(1);
    expect((mesh.material as MeshStandardMaterial).roughness).toBe(0.4);
  });

  it('applies one override to every mesh sharing the material name', () => {
    const scene = new Scene();
    const wallA = makeMesh('panel_a', 'wall_mat');
    const wallB = makeMesh('panel_b', 'wall_mat');
    scene.add(wallA, wallB);

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'WALL_MAT', roughness: 0.2 }),
    ]);

    expect(applied).toBe(2);
    expect((wallA.material as MeshStandardMaterial).roughness).toBe(0.2);
    expect((wallB.material as MeshStandardMaterial).roughness).toBe(0.2);
  });

  it('applies different colors to different meshes without cross-contamination', () => {
    const scene = new Scene();
    const gold = makeMesh('gold_frame');
    const oak = makeMesh('oak_panel');
    scene.add(gold, oak);

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'gold_frame', color: '#d4af37' }),
      makeOverride({ element: 'oak_panel', color: '#8b5a2b' }),
    ]);

    expect(applied).toBe(2);
    expect((gold.material as MeshStandardMaterial).color.getHexString()).toBe('d4af37');
    expect((oak.material as MeshStandardMaterial).color.getHexString()).toBe('8b5a2b');
  });

  it('skips non-matching meshes and unknown elements', () => {
    const scene = new Scene();
    const mesh = makeMesh('wall');
    scene.add(mesh);

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'floor', color: '#ffffff' }),
    ]);

    expect(applied).toBe(0);
    expect((mesh.material as MeshStandardMaterial).color.getHexString()).toBe('ffffff');
    expect((mesh.material as MeshStandardMaterial).version).toBe(0);
  });

  it('renames the material when override.name is set', () => {
    const scene = new Scene();
    const mesh = makeMesh('column', 'raw_material');
    scene.add(mesh);

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'column', name: 'polished_marble' }),
    ]);

    expect(applied).toBe(1);
    expect((mesh.material as MeshStandardMaterial).name).toBe('polished_marble');
  });

  it('ignores non-mesh objects in the scene graph', () => {
    const scene = new Scene();
    const group = new Scene();
    group.name = 'gold_trim';
    scene.add(group);
    scene.add(makeMesh('other'));

    const applied = applyMaterialOverrides(scene, [
      makeOverride({ element: 'gold_trim', color: '#d4af37' }),
    ]);

    expect(applied).toBe(0);
  });
});
