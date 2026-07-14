
export interface ModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  exposure: number;
  envMapIntensity: number;
  cinematicPoints: {
    name: string;
    position: [number, number, number];
    lookAt: [number, number, number];
  }[];
}

/**
 * Static model registry — maps project identifiers to 3D model configurations.
 *
 * TODO: Replace with API-driven config loaded from backend alongside project data
 * so the registry scales without code changes as the portfolio grows.
 */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
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
  },
};

/** Returns the config for a given project ID, falling back to the default model. */
export function getModelConfig(projectId?: string): ModelConfig {
  return MODEL_REGISTRY[projectId || 'default'] ?? MODEL_REGISTRY['default'];
}
