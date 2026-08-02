import type { MaterialPreset } from '../store/designer-store';

/**
 * Single source of truth for the 3D scene's PBR surface presets.
 *
 * Consumed by the architectural model + procedural architecture so the
 * rendered materials react to `activeMaterial` from the designer store,
 * mirroring the options exposed in DesignerModeConfigurator:
 * - obsidian_marble   → dark, highly polished, mirror-like
 * - warm_oak          → warm timber, diffuse and rough
 * - brushed_titanium  → neutral machined metal with soft sheen
 * - raw_concrete      → matte architectural concrete
 */
export interface MaterialPresetConfig {
  /** Base albedo color (hex). */
  color: string;
  /** Micro-surface roughness (0 = mirror, 1 = fully matte). */
  roughness: number;
  /** Metallic response (0 = dielectric, 1 = full metal). */
  metalness: number;
  /** Environment reflection intensity multiplier. */
  envMapIntensity: number;
  /** Clearcoat layer strength (0 = none, 1 = full lacquer). */
  clearcoat: number;
}

export const MATERIAL_PRESETS: Record<MaterialPreset, MaterialPresetConfig> = {
  obsidian_marble: {
    color: '#121212',
    roughness: 0.15,
    metalness: 0.85,
    envMapIntensity: 1.5,
    clearcoat: 1,
  },
  warm_oak: {
    color: '#8b5a2b',
    roughness: 0.65,
    metalness: 0.05,
    envMapIntensity: 0.6,
    clearcoat: 0,
  },
  brushed_titanium: {
    color: '#8a8a8e',
    roughness: 0.35,
    metalness: 0.85,
    envMapIntensity: 1.2,
    clearcoat: 0.4,
  },
  raw_concrete: {
    color: '#5a5a5a',
    roughness: 0.85,
    metalness: 0.05,
    envMapIntensity: 0.4,
    clearcoat: 0,
  },
};

/** Returns the material config for a preset, defaulting to obsidian marble. */
export function getMaterialPreset(preset: MaterialPreset): MaterialPresetConfig {
  return MATERIAL_PRESETS[preset] ?? MATERIAL_PRESETS.obsidian_marble;
}
