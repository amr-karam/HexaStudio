import type { LightingPreset } from '../store/designer-store';

/**
 * Single source of truth for the 3D scene's lighting rig.
 *
 * Consumed by the R3F canvas (see ExperienceCanvas) so that the rendered
 * lights react to `activeLighting` from the designer store, mirroring the
 * options exposed in DesignerModeConfigurator:
 * - daylight    → 6500K natural high-noon sun, crisp architectural shadows
 * - golden_hour → warm amber sunset with a low warm key light
 * - cyberpunk   → deep violet ambient with cyan neon directional light
 * - gallery     → neutral white pin-point spotlight presentation
 */
export interface LightingPresetConfig {
  /** AmbientLight intensity. */
  ambientIntensity: number;
  /** AmbientLight color (hex). */
  ambientColor: string;
  /** Key directional light intensity. */
  directionalIntensity: number;
  /** Key directional light color (hex). */
  directionalColor: string;
  /** Key directional light world position. */
  directionalPosition: [number, number, number];
  /** Environment map reflection intensity multiplier. */
  envIntensity: number;
}

export const LIGHTING_PRESETS: Record<LightingPreset, LightingPresetConfig> = {
  daylight: {
    ambientIntensity: 0.5,
    ambientColor: '#eaf1ff',
    directionalIntensity: 2,
    directionalColor: '#ffffff',
    directionalPosition: [8, 12, 4],
    envIntensity: 1,
  },
  golden_hour: {
    ambientIntensity: 0.35,
    ambientColor: '#ffd9a0',
    directionalIntensity: 1.6,
    directionalColor: '#ff9a3c',
    directionalPosition: [-6, 4, -4],
    envIntensity: 0.85,
  },
  cyberpunk: {
    ambientIntensity: 0.45,
    ambientColor: '#2a1052',
    directionalIntensity: 1.5,
    directionalColor: '#4dd9ff',
    directionalPosition: [0, 6, -8],
    envIntensity: 0.7,
  },
  gallery: {
    ambientIntensity: 0.3,
    ambientColor: '#f2f2f4',
    directionalIntensity: 1.8,
    directionalColor: '#ffffff',
    directionalPosition: [0, 15, 0],
    envIntensity: 1.2,
  },
};

/** Returns the lighting config for a preset, defaulting to daylight. */
export function getLightingPreset(preset: LightingPreset): LightingPresetConfig {
  return LIGHTING_PRESETS[preset] ?? LIGHTING_PRESETS.daylight;
}
