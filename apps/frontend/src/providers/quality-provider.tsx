'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualityTier {
  level: QualityLevel;
  shadows: boolean;
  shadowMapSize: number;
  postProcessing: boolean;
  antialias: 'msaa' | 'smaa' | false;
  maxDpr: number;
  contactShadows: boolean;
  maxTriangles: number;
  particleCount: number;
}

type UserOverride = 'auto' | 'performance' | 'quality';

/* -------------------------------------------------------------------------- */
/*  Tier map                                                                   */
/* -------------------------------------------------------------------------- */

const TIER_MAP: Record<QualityLevel, QualityTier> = {
  low: {
    level: 'low',
    shadows: false,
    shadowMapSize: 512,
    postProcessing: false,
    antialias: false,
    maxDpr: 1,
    contactShadows: false,
    maxTriangles: 50_000,
    particleCount: 50,
  },
  medium: {
    level: 'medium',
    shadows: true,
    shadowMapSize: 1024,
    postProcessing: false,
    antialias: 'smaa',
    maxDpr: 1.5,
    contactShadows: true,
    maxTriangles: 200_000,
    particleCount: 100,
  },
  high: {
    level: 'high',
    shadows: true,
    shadowMapSize: 2048,
    postProcessing: true,
    antialias: 'msaa',
    maxDpr: 2,
    contactShadows: true,
    maxTriangles: 500_000,
    particleCount: 200,
  },
};

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

interface QualityContextValue {
  tier: QualityTier;
  /** Whether detection is complete (false = still probing). */
  ready: boolean;
  /** User override: 'auto' defers to detection. */
  override: UserOverride;
  setOverride: (o: UserOverride) => void;
}

const QualityContext = createContext<QualityContextValue>({
  tier: TIER_MAP.medium,
  ready: false,
  override: 'auto',
  setOverride: () => {},
});

/* -------------------------------------------------------------------------- */
/*  WebGL capability probe (single context, disposable)                        */
/* -------------------------------------------------------------------------- */

function probeWebGL(): QualityLevel {
  if (typeof document === 'undefined') return 'medium';

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return 'low';

  // Try to get the GPU renderer string for heuristic classification.
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer: string = debugInfo
    ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
    : '';

  // Lose the context promptly to free the probe resources.
  const loseCtx = gl.getExtension('WEBGL_lose_context');
  if (loseCtx) loseCtx.loseContext();

  // --- Heuristic classification ---
  const r = renderer.toLowerCase();

  // High-end discrete GPUs
  if (
    r.includes('rtx') ||
    r.includes('radeon rx') ||
    r.includes('radeon pro') ||
    r.includes('apple m2 max') ||
    r.includes('apple m3 max') ||
    r.includes('apple m4 max') ||
    r.includes('geforce gtx 1080')
  ) {
    return 'high';
  }

  // Low-end / mobile / integrated
  if (
    r.includes('intel') ||
    r.includes('mali') ||
    r.includes('adreno') ||
    r.includes('powervr') ||
    r.includes('swiftshader') ||
    r.includes('mobile')
  ) {
    return 'low';
  }

  return 'medium';
}

function detectTier(): QualityLevel {
  if (typeof navigator === 'undefined') return 'medium';

  let score = 0;

  // 1. CPU cores
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;

  // 2. Device memory (Chrome only)
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined) {
    if (mem >= 8) score += 2;
    else if (mem >= 4) score += 1;
  }

  // 3. DPR
  const dpr = window.devicePixelRatio ?? 1;
  if (dpr >= 2) score += 1;

  // 4. Viewport pixels
  const pixels = window.screen.width * window.screen.height;
  if (pixels >= 2_000_000) score += 1; // >= 1080p equivalent at DPR 1

  // 5. Save-data
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) score -= 2;

  // 6. Touch / coarse pointer
  if (window.matchMedia('(pointer: coarse)').matches) score -= 1;

  // 7. WebGL probe
  const glLevel = probeWebGL();
  if (glLevel === 'high') score += 2;
  else if (glLevel === 'low') score -= 1;

  // Classify
  if (score >= 4) return 'high';
  if (score <= 1) return 'low';
  return 'medium';
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = 'hexa-quality-override';

function readOverride(): UserOverride {
  if (typeof window === 'undefined') return 'auto';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'performance' || v === 'quality') return v;
  } catch {
    // localStorage unavailable
  }
  return 'auto';
}

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [detectedLevel, setDetectedLevel] = useState<QualityLevel>('medium');
  const [override, setOverride] = useState<UserOverride>(readOverride);

  // One-time detection on mount.
  useEffect(() => {
    // Start with low until detection completes to avoid over-committing GPU.
    setDetectedLevel(detectTier());
    setReady(true);
  }, []);

  // Persist user override.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, override);
    } catch {
      // ignore
    }
  }, [override]);

  // Resolve effective level.
  const effectiveLevel: QualityLevel = useMemo(() => {
    if (override === 'performance') return 'low';
    if (override === 'quality') return 'high';
    return detectedLevel;
  }, [override, detectedLevel]);

  const tier = useMemo(() => TIER_MAP[effectiveLevel], [effectiveLevel]);

  const ctx = useMemo<QualityContextValue>(
    () => ({ tier, ready, override, setOverride }),
    [tier, ready, override, setOverride],
  );

  return (
    <QualityContext.Provider value={ctx}>{children}</QualityContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useQualityTier(): QualityContextValue {
  return useContext(QualityContext);
}
