
import type { ModelConfig } from '@hexastudio/types';

/**
 * Static fallback registry if API is down or loading.
 */
const FALLBACK_REGISTRY: Record<string, ModelConfig> = {
  'default': {
    path: '/models/hexa-crystal.glb',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    exposure: 1,
    envMapIntensity: 1,
    cinematicPoints: [
      { name: 'Hero', position: [0, 2, 5], lookAt: [0, 0, 0] },
      { name: 'Detail', position: [2, 1, 2], lookAt: [0, 0, 0] },
    ],
    animation: { autoplay: true, loop: 2201, speed: 1 },
  },
  'tower': {
    path: '/models/tower.glb',
    scale: 0.5,
    position: [0, -2, 0],
    rotation: [0, 0, 0],
    exposure: 1.2,
    envMapIntensity: 1.5,
    cinematicPoints: [
      { name: 'Ground', position: [0, 0, 10], lookAt: [0, 5, 0] },
      { name: 'Mid-Rise', position: [5, 15, 5], lookAt: [0, 15, 0] },
      { name: 'Summit', position: [0, 40, 2], lookAt: [0, 40, 0] },
    ],
    animation: { autoplay: true, loop: 2201, speed: 1 },
  },
};

/** Returns the default config (synchronous), falling back to hexa-crystal. */
export function getDefaultModelConfig(projectId?: string): ModelConfig {
  return FALLBACK_REGISTRY[projectId || 'default'] ?? FALLBACK_REGISTRY['default'];
}

/** Fetches the config for a given project ID from the backend. */
export async function fetchModelConfig(projectId: string): Promise<ModelConfig> {
  try {
    const response = await fetch(`/api/v1/projects/${projectId}/model-config`);
    if (!response.ok) throw new Error('Failed to fetch model config');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch model config, using fallback:', error);
    return getDefaultModelConfig(projectId);
  }
}
