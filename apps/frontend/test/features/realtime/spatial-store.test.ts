import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSpatialStore,
  extractLightingPreset,
  extractMaterialPreset,
  parseCameraPayload,
  isSpatialCommand,
  isVec3,
} from '@/features/realtime/spatial-store';

describe('spatial-store', () => {
  beforeEach(() => {
    useSpatialStore.getState().clear();
  });

  it('starts with no command', () => {
    expect(useSpatialStore.getState().lastCommand).toBeNull();
    expect(useSpatialStore.getState().history).toHaveLength(0);
  });

  it('dispatches SET_LIGHTING and preserves history', () => {
    const cmd = {
      type: 'SET_LIGHTING' as const,
      payload: { preset: 'golden_hour' },
      metadata: { triggeredBy: 'ai-agent' as const, agentPersona: 'live-designer' },
    };
    useSpatialStore.getState().dispatch(cmd);
    expect(useSpatialStore.getState().lastCommand).toEqual(cmd);
    expect(useSpatialStore.getState().history).toHaveLength(1);
    expect(useSpatialStore.getState().lastAppliedAt).toBeTypeOf('number');
  });

  it('keeps a bounded history (last 20)', () => {
    for (let i = 0; i < 25; i++) {
      useSpatialStore.getState().dispatch({
        type: 'SET_MATERIAL',
        payload: { preset: 'warm_oak' },
        metadata: { triggeredBy: 'user' },
      });
    }
    expect(useSpatialStore.getState().history).toHaveLength(20);
  });

  it('validates SpatialCommand shape', () => {
    expect(
      isSpatialCommand({
        type: 'SET_CAMERA',
        payload: { position: [0, 5, 5] },
        metadata: { triggeredBy: 'user' },
      }),
    ).toBe(true);

    expect(isSpatialCommand({ type: 'UNKNOWN', payload: {}, metadata: { triggeredBy: 'user' } })).toBe(false);
    expect(isSpatialCommand(null)).toBe(false);
    expect(
      isSpatialCommand({ type: 'SET_LIGHTING', payload: {}, metadata: { triggeredBy: 'other' } }),
    ).toBe(false);
  });
});

describe('extractLightingPreset', () => {
  it.each([
    [{ preset: 'golden_hour' }, 'golden_hour'],
    [{ lightingPreset: 'cyberpunk' }, 'cyberpunk'],
    [{ lighting: 'gallery' }, 'gallery'],
    [{ preset: 'GOLDEN_HOUR' }, 'golden_hour'],
    [{ preset: 'golden-hour' }, 'golden_hour'],
    [{ preset: 'daylight' }, 'daylight'],
  ])('extracts %j → %s', (payload, expected) => {
    expect(extractLightingPreset(payload as Record<string, unknown>)).toBe(expected);
  });

  it('returns null for unknown preset', () => {
    expect(extractLightingPreset({ preset: 'unknown' } as Record<string, unknown>)).toBeNull();
    expect(extractLightingPreset({} as Record<string, unknown>)).toBeNull();
  });
});

describe('extractMaterialPreset', () => {
  it.each([
    [{ preset: 'warm_oak' }, 'warm_oak'],
    [{ materialPreset: 'brushed_titanium' }, 'brushed_titanium'],
    [{ material: 'obsidian_marble' }, 'obsidian_marble'],
    [{ preset: 'WARM_OAK' }, 'warm_oak'],
    [{ preset: 'warm-oak' }, 'warm_oak'],
    [{ preset: 'raw_concrete' }, 'raw_concrete'],
  ])('extracts %j → %s', (payload, expected) => {
    expect(extractMaterialPreset(payload as Record<string, unknown>)).toBe(expected);
  });

  it('returns null for unknown preset', () => {
    expect(extractMaterialPreset({ preset: 'plywood' } as Record<string, unknown>)).toBeNull();
  });
});

describe('parseCameraPayload', () => {
  it('parses position + target + preset + fov', () => {
    const parsed = parseCameraPayload({
      position: [5, 5, 5],
      target: [0, 1, 0],
      preset: 'overview',
      fov: 45,
    });
    expect(parsed.position).toEqual([5, 5, 5]);
    expect(parsed.target).toEqual([0, 1, 0]);
    expect(parsed.preset).toBe('overview');
    expect(parsed.fov).toBe(45);
  });

  it('handles lookAt alias and empty payload', () => {
    expect(parseCameraPayload({ lookAt: [1, 2, 3] }).target).toEqual([1, 2, 3]);
    expect(parseCameraPayload({}).position).toBeNull();
    expect(parseCameraPayload({ position: [1, 2] } as unknown as Record<string, unknown>).position).toBeNull();
  });

  it('rejects invalid fov', () => {
    expect(parseCameraPayload({ fov: 0 } as Record<string, unknown>).fov).toBeNull();
    expect(parseCameraPayload({ fov: 200 } as Record<string, unknown>).fov).toBeNull();
    expect(parseCameraPayload({ fov: '45' } as unknown as Record<string, unknown>).fov).toBeNull();
  });
});

describe('isVec3', () => {
  it('validates vec3 tuples', () => {
    expect(isVec3([1, 2, 3])).toBe(true);
    expect(isVec3([0, 0, 0])).toBe(true);
    expect(isVec3([1, 2])).toBe(false);
    expect(isVec3(['1', 2, 3] as unknown as [number, number, number])).toBe(false);
    expect(isVec3(null)).toBe(false);
  });
});
