'use client';

import { create } from 'zustand';
import type { LightingPreset, MaterialPreset } from '@/features/scene/store/designer-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SpatialCommandType = 'SET_LIGHTING' | 'SET_MATERIAL' | 'SET_CAMERA';

export interface SpatialCommand {
  type: SpatialCommandType;
  payload: Record<string, unknown>;
  metadata: {
    triggeredBy: 'ai-agent' | 'user';
    agentPersona?: string;
    timestamp?: string;
  };
}

/**
 * Payload shape helpers — backend sends Record<string, unknown> but we
 * normalise to typed presets in the bridge. These extractors are permissive
 * to handle `preset`, `lightingPreset`, `materialPreset`, etc. variations
 * emitted by AI tools or future backend versions.
 */
const LIGHTING_PRESETS = ['daylight', 'golden_hour', 'cyberpunk', 'gallery'] as const;
const MATERIAL_PRESETS = ['obsidian_marble', 'warm_oak', 'brushed_titanium', 'raw_concrete'] as const;

const LIGHTING_SET = new Set<string>(LIGHTING_PRESETS);
const MATERIAL_SET = new Set<string>(MATERIAL_PRESETS);

function normalisePresetToken(value: string): string {
  return value.trim().toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

function camelToSnake(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function extractLightingPreset(payload: Record<string, unknown>): LightingPreset | null {
  const candidates: unknown[] = [
    payload.preset,
    payload.lightingPreset,
    payload.lighting,
    payload.value,
    payload.presetName,
    payload.lighting_preset,
  ];

  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const normalised = normalisePresetToken(raw);
    if (LIGHTING_SET.has(normalised)) return normalised as LightingPreset;
    const snake = normalisePresetToken(camelToSnake(raw));
    if (LIGHTING_SET.has(snake)) return snake as LightingPreset;
  }
  return null;
}

export function extractMaterialPreset(payload: Record<string, unknown>): MaterialPreset | null {
  const candidates: unknown[] = [
    payload.preset,
    payload.materialPreset,
    payload.material,
    payload.value,
    payload.presetName,
    payload.material_preset,
  ];

  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const normalised = normalisePresetToken(raw);
    if (MATERIAL_SET.has(normalised)) return normalised as MaterialPreset;
    const snake = normalisePresetToken(camelToSnake(raw));
    if (MATERIAL_SET.has(snake)) return snake as MaterialPreset;
  }
  return null;
}

export function isVec3(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

export interface ParsedCameraPayload {
  position: [number, number, number] | null;
  target: [number, number, number] | null;
  preset: string | null;
  fov: number | null;
}

export function parseCameraPayload(payload: Record<string, unknown>): ParsedCameraPayload {
  let position: [number, number, number] | null = null;
  let target: [number, number, number] | null = null;
  let preset: string | null = null;
  let fov: number | null = null;

  const posCandidate = payload.position ?? payload.cameraPosition ?? payload.pos;
  if (isVec3(posCandidate)) position = posCandidate;

  const targetCandidate = payload.target ?? payload.lookAt ?? payload.look_at ?? payload.focus ?? payload.cameraTarget;
  if (isVec3(targetCandidate)) target = targetCandidate;

  const presetCandidate = payload.preset ?? payload.cameraPreset ?? payload.view ?? payload.orbit;
  if (typeof presetCandidate === 'string' && presetCandidate.trim().length > 0) {
    preset = presetCandidate.trim();
  }

  const fovCandidate = payload.fov ?? payload.fieldOfView;
  if (typeof fovCandidate === 'number' && Number.isFinite(fovCandidate) && fovCandidate > 0 && fovCandidate < 180) {
    fov = fovCandidate;
  }

  return { position, target, preset, fov };
}

export function isSpatialCommandType(value: unknown): value is SpatialCommandType {
  return value === 'SET_LIGHTING' || value === 'SET_MATERIAL' || value === 'SET_CAMERA';
}

export function isSpatialCommand(value: unknown): value is SpatialCommand {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!isSpatialCommandType(obj.type)) return false;
  if (typeof obj.payload !== 'object' || obj.payload === null) return false;
  if (typeof obj.metadata !== 'object' || obj.metadata === null) return false;
  const meta = obj.metadata as Record<string, unknown>;
  if (meta.triggeredBy !== 'ai-agent' && meta.triggeredBy !== 'user') return false;
  return true;
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

interface SpatialStoreState {
  lastCommand: SpatialCommand | null;
  history: SpatialCommand[];
  /** Unix epoch ms of last dispatch, for consumers that need staleness checks */
  lastAppliedAt: number | null;
  dispatch: (command: SpatialCommand) => void;
  clear: () => void;
}

export const useSpatialStore = create<SpatialStoreState>((set) => ({
  lastCommand: null,
  history: [],
  lastAppliedAt: null,
  dispatch: (command) =>
    set((state) => ({
      lastCommand: command,
      history: [...state.history.slice(-19), command],
      lastAppliedAt: Date.now(),
    })),
  clear: () => set({ lastCommand: null }),
}));
