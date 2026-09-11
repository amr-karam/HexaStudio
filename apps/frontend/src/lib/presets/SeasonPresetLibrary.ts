/**
 * SeasonPresetLibrary.ts
 * Bridges season-presets.json → Three.js scene configuration
 * HEXA Studio — Sprint S022.2
 * Created: 2026-09-10
 */

import { Color, MeshStandardMaterial, Vector3 } from 'three'
import rawData from '../../data/presets/season-presets.json'

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

// Raw JSON data — cast through unknown for proper type assertion
const presetsData: SeasonPresetsData = rawData as unknown as SeasonPresetsData

/**
 * Get all available season presets
 * @returns ScenePreset[] — all 4 presets (Ramadan, Winter, Summer, Autumn)
 */
export function getAllPresets(): ScenePreset[] {
  return presetsData.presets
}

/**
 * Get a preset by its ID
 * @param id — e.g. "ramadan-2026", "winter-2026"
 * @returns ScenePreset | null
 */
export function getPreset(id: string): ScenePreset | null {
  const found = presetsData.presets.find((p) => p.id === id)
  if (!found) {
    console.warn(`[SeasonPresetLibrary] Preset not found: ${id}`)
    return null
  }
  return found
}

/**
 * Get the default Ramadan preset
 * @returns ScenePreset — the culturally-authentic Ramadan scene
 */
export function getRamadanPreset(): ScenePreset {
  const preset = getPreset('ramadan-2026')
  if (!preset) {
    throw new Error('[SeasonPresetLibrary] Ramadan preset not found')
  }
  return preset
}

/**
 * Apply material overrides to Three.js material properties
 * @param material — Three.js MeshStandardMaterial to modify
 * @param materialId — e.g. "mashrabiya-wood"
 * @param preset — the scene preset containing overrides
 */
export function applyMaterialOverrides(
  material: MeshStandardMaterial,
  materialId: string,
  preset: ScenePreset
): void {
  const overrides = preset.materialOverrides[materialId]
  if (!overrides) return

  if (overrides.roughness !== undefined) material.roughness = overrides.roughness
  if (overrides.metalness !== undefined) material.metalness = overrides.metalness
  if (overrides.color !== undefined) material.color = hexToColor(overrides.color)
}

/**
 * Convert hex color string to THREE.Color
 * @param hex — hex color string (e.g. "#ff0000")
 * @returns THREE.Color
 */
function hexToColor(hex: string): Color {
  return new Color(hex)
}

/**
 * Convert array to THREE.Vector3
 * @param arr — [x, y, z] array
 * @returns THREE.Vector3
 */
function posToVector3(arr: [number, number, number]): Vector3 {
  return new Vector3(arr[0], arr[1], arr[2])
}

/**
 * Get camera configuration for a preset
 */
export function getCameraConfig(preset: ScenePreset): { fov: number; position: Vector3 } {
  return { fov: preset.camera.fov, position: posToVector3(preset.camera.position) }
}

/**
 * Get lighting configuration for a preset, typed for Three.js
 */
export function getLightingConfig(preset: ScenePreset) {
  const { lighting } = preset
  return {
    ambient: { intensity: lighting.ambientIntensity, color: hexToColor(lighting.ambientColor) },
    directional: { intensity: lighting.directionalIntensity, color: hexToColor(lighting.directionalColor), position: posToVector3(lighting.directionalPosition) },
    hemisphere: { intensity: lighting.hemisphereIntensity, color: hexToColor(lighting.hemisphereColor) },
  }
}