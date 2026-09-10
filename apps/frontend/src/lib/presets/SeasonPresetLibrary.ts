/**
 * SeasonPresetLibrary.ts
 * Bridges season-presets.json → Three.js scene configuration
 * HEXA Studio — Sprint S022.2
 * Created: 2026-09-10
 */

import { Color, Vector3 } from 'three';
import type { Material } from 'three';

// Type definitions — strict, compile-time safe
export interface PresetLighting {
  ambientIntensity: number
  ambientColor: string
  directionalIntensity: number
  directionalColor: string
  directionalPosition: [number, number, number]
  hemisphereIntensity: number
  hemisphereColor: string
}

export interface PresetFog {
  enabled: boolean
  color?: string
  near?: number
  far?: number
}

export interface PresetEnvironment {
  preset: string
  intensity: number
}

export interface PresetCamera {
  fov: number
  position: [number, number, number]
}

export interface ScenePreset {
  id: string
  name: string
  theme: string
  description: string
  lighting: PresetLighting
  fog: PresetFog
  environment: PresetEnvironment
  materialOverrides: Record<string, Partial<{
    roughness: number
    metalness: number
    color: string
  }>>
  decorativeElements: string[]
  camera: PresetCamera
}

export interface PresetMetadata {
  version: string
  created: string
  studio: string
  culturalContext: string[]
  compatibility: string
}

export interface SeasonPresetsData {
  presets: ScenePreset[]
  metadata: PresetMetadata
}

// Raw JSON import (typed at runtime via assertion)
import presetsDataRaw from '../data/presets/season-presets.json';
const presetsData: SeasonPresetsData = presetsDataRaw as unknown as SeasonPresetsData;

/**
 * Get all available season presets
 * @returns ScenePreset[] — all 4 presets (Ramadan, Winter, Summer, Autumn)
 */
export function getAllPresets(): ScenePreset[] {
  return presetsData.presets;
}

/**
 * Get a preset by its ID
 * @param id — e.g. "ramadan-2026", "winter-2026", "summer-noon", "autumn-harvest"
 * @returns ScenePreset | null
 */
export function getPreset(id: string): ScenePreset | null {
  const found = presetsData.presets.find((p) => p.id === id);
  if (!found) {
    console.warn(`[SeasonPresetLibrary] Preset not found: ${id}`);
    return null;
  }
  return found;
}

/**
 * Get the default Ramadan preset
 * @returns ScenePreset — the culturally-authentic Ramadan scene
 */
export function getRamadanPreset(): ScenePreset {
  const preset = getPreset('ramadan-2026');
  if (!preset) throw new Error('FATAL: ramadan-2026 preset missing from season-presets.json');
  return preset;
}

/**
 * Convert a hex color string to a Three.js Color object
 * @param hex — e.g. "#ffd27f"
 * @returns Color
 */
export function hexToColor(hex: string): Color {
  return new Color(hex)
}

/**
 * Convert a position tuple to a Three.js Vector3
 * @param pos — [x, y, z]
 * @returns Vector3
 */
export function posToVector3(pos: [number, number, number]): Vector3 {
  return new Vector3(pos[0], pos[1], pos[2])
}

/**
 * Apply material overrides to Three.js material properties
 * @param material — the Three.js material to modify
 * @param materialId — e.g. "mashrabiya-wood", "limestone-nile"
 * @param preset — the scene preset containing overrides
 */
export function applyMaterialOverrides(
  material: any,
  materialId: string,
  preset: ScenePreset
): void {
  const overrides = preset.materialOverrides[materialId];
  if (!overrides) return;

  if (overrides.roughness !== undefined) {
    material.roughness = overrides.roughness;
  }
  if (overrides.metalness !== undefined) {
    material.metalness = overrides.metalness;
  }
  if (overrides.color !== undefined) {
    material.color = hexToColor(overrides.color);
  }
}

/**
 * Get decorative element names for a preset
 * @param preset — ScenePreset
 * @returns string[] — e.g. ["lantern", "mosque-lamp", "arabic-carpet"]
 */
export function getDecorativeElements(preset: ScenePreset): string[] {
  return preset.decorativeElements
}

/**
 * Get camera configuration for a preset
 * @param preset — ScenePreset
 * @returns { fov, position }
 */
export function getCameraConfig(preset: ScenePreset): {
  fov: number
  position: Vector3
} {
  return {
    fov: preset.camera.fov,
    position: posToVector3(preset.camera.position)
  }
}

/**
 * Get lighting configuration for a preset, typed for Three.js
 * @param preset — ScenePreset
 */
export function getLightingConfig(preset: ScenePreset) {
  const { lighting } = preset
  return {
    ambient: {
      intensity: lighting.ambientIntensity,
      color: hexToColor(lighting.ambientColor)
    },
    directional: {
      intensity: lighting.directionalIntensity,
      color: hexToColor(lighting.directionalColor),
      position: posToVector3(lighting.directionalPosition)
    },
    hemisphere: {
      intensity: lighting.hemisphereIntensity,
      color: hexToColor(lighting.hemisphereColor)
    }
  }
}

/**
 * Get fog configuration for a preset
 * @param preset — ScenePreset
 */
export function getFogConfig(preset: ScenePreset) {
  const { fog } = preset
  return {
    enabled: fog.enabled,
    color: fog.color ? hexToColor(fog.color) : null,
    near: fog.near ?? 5,
    far: fog.far ?? 50
  }
}

export { presetsData as rawPresets };
export default getRamadanPreset;
