export const XR_SESSION_OPTIONS = {
  ar: {
    requiredFeatures: ['local-floor'] as const,
    optionalFeatures: ['hit-test', 'anchors', 'dom-overlay'] as const,
  },
  vr: {
    requiredFeatures: ['local-floor'] as const,
    optionalFeatures: ['hand-tracking'] as const,
  },
} as const;

export const XR_QUALITY = {
  dpr: [1, 1.2] as [number, number],
  shadowResolution: 1024,
  disablePostProcessing: true,
  framebufferScale: 0.8,
} as const;

export const TELEPORT_SETTINGS = {
  maxDistance: 8,
  speed: 12,
  curveHeight: 0.5,
} as const;

export const DEFAULT_MODEL_SCALE = 0.01;
