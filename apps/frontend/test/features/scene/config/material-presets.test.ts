import { describe, it, expect } from 'vitest';
import { MATERIAL_PRESETS, getMaterialPreset, MaterialPresetConfig } from '@/features/scene/config/material-presets';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

describe('material presets', () => {
  it('defines all four material presets', () => {
    expect(Object.keys(MATERIAL_PRESETS)).toEqual([
      'obsidian_marble',
      'warm_oak',
      'brushed_titanium',
      'raw_concrete',
    ]);
  });

  it.each(Object.entries(MATERIAL_PRESETS))('%s has valid numeric surface values', (_name, preset) => {
    expect(preset.roughness).toBeGreaterThanOrEqual(0);
    expect(preset.roughness).toBeLessThanOrEqual(1);
    expect(preset.metalness).toBeGreaterThanOrEqual(0);
    expect(preset.metalness).toBeLessThanOrEqual(1);
    expect(preset.clearcoat).toBeGreaterThanOrEqual(0);
    expect(preset.clearcoat).toBeLessThanOrEqual(1);
    expect(preset.envMapIntensity).toBeGreaterThan(0);
    expect(typeof preset.color).toBe('string');
  });

  it.each(Object.entries(MATERIAL_PRESETS))('%s uses a valid hex color', (_name, preset) => {
    expect(preset.color).toMatch(HEX_COLOR);
  });

  it('keeps obsidian dark & metallic and concrete gray & rough', () => {
    expect(MATERIAL_PRESETS.obsidian_marble.metalness).toBeGreaterThan(0.5);
    expect(MATERIAL_PRESETS.obsidian_marble.roughness).toBeLessThan(0.3);
    expect(MATERIAL_PRESETS.raw_concrete.roughness).toBeGreaterThan(0.5);
    expect(MATERIAL_PRESETS.raw_concrete.metalness).toBeLessThan(0.3);
  });

  it('returns a typed config via the getter helper', () => {
    const preset: MaterialPresetConfig = getMaterialPreset('warm_oak');
    expect(preset).toEqual(MATERIAL_PRESETS.warm_oak);
  });
});
