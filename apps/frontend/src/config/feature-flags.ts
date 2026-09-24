export interface FeatureFlags {
  agentSemanticMemory: boolean;
  collaborationSync: boolean;
  xrGuidedTour: boolean;
  webglProfiling: boolean;
}

export const defaultFlags: FeatureFlags = {
  agentSemanticMemory: true,
  collaborationSync: true,
  xrGuidedTour: true,
  webglProfiling: true,
};

export function getFeatureFlag(key: keyof FeatureFlags): boolean {
  // In production, read from environment or remote config
  return defaultFlags[key];
}
