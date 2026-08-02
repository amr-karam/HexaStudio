import { describe, it, expect } from 'vitest';
import { LIGHTING_PRESETS, getLightingPreset, LightingPresetConfig } from '@/features/scene/config/lighting-presets';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

describe('lighting presets', () => {
  it('defines all four lighting presets', () => {
    expect(Object.keys(LIGHTING_PRESETS)).toEqual([
      'daylight',
      'golden_hour',
      'cyberpunk',
      'gallery',
    ]);
  });

  it.each(Object.entries(LIGHTING_PRESETS))('%s has valid numeric intensities', (_name, preset) => {
    expect(Number.isFinite(preset.ambientIntensity)).toBe(true);
    expect(Number.isFinite(preset.directionalIntensity)).toBe(true);
    expect(Number.isFinite(preset.envIntensity)).toBe(true);
    expect(preset.ambientIntensity).toBeGreaterThan(0);
    expect(preset.directionalIntensity).toBeGreaterThan(0);
    expect(preset.envIntensity).toBeGreaterThan(0);
  });

  it.each(Object.entries(LIGHTING_PRESETS))('%s has valid colors and a 3D directional position', (_name, preset) => {
    expect(preset.ambientColor).toMatch(HEX_COLOR);
    expect(preset.directionalColor).toMatch(HEX_COLOR);
    expect(preset.directionalPosition).toHaveLength(3);
    for (const axis of preset.directionalPosition) {
      expect(typeof axis).toBe('number');
      expect(Number.isFinite(axis)).toBe(true);
    }
  });

  it('keeps daylight bluish-white and golden hour warm', () => {
    expect(LIGHTING_PRESETS.daylight.directionalColor).toBe('#ffffff');
    expect(LIGHTING_PRESETS.daylight.ambientColor).toBe('#eaf1ff');
    expect(LIGHTING_PRESETS.golden_hour.directionalColor).toMatch(/^#ff[a-f0-9]{4}$/);
  });

  it('returns a typed config via the getter helper', () => {
    const preset: LightingPresetConfig = getLightingPreset('cyberpunk');
    expect(preset).toEqual(LIGHTING_PRESETS.cyberpunk);
  });
});
