import { useState, useEffect } from 'react';

export type QualityLevel = 'low' | 'medium' | 'high';

interface QualitySettings {
  dpr: [number, number];
  shadows: boolean;
  postProcessing: boolean;
  textureResolution: 'low' | 'medium' | 'high';
}

const QUALITY_MAP: Record<QualityLevel, QualitySettings> = {
  low: {
    dpr: [1, 1],
    shadows: false,
    postProcessing: false,
    textureResolution: 'low',
  },
  medium: {
    dpr: [1, 1.5],
    shadows: true,
    postProcessing: true,
    textureResolution: 'medium',
  },
  high: {
    dpr: [1, 2],
    shadows: true,
    postProcessing: true,
    textureResolution: 'high',
  },
};

export function useAdaptiveQuality() {
  const [quality, setQuality] = useState<QualityLevel>('medium');

  useEffect(() => {
    // Detect GPU capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      setQuality('low');
      return;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // Simple heuristic for high-end GPUs (NVIDIA RTX, Apple M-series Max, etc.)
    if (renderer.includes('RTX') || renderer.includes('Radeon RX') || renderer.includes('Apple M2 Max') || renderer.includes('Apple M3 Max')) {
      setQuality('high');
    } else if (renderer.includes('Intel') || renderer.includes('AMD') || renderer.includes('Mobile')) {
      setQuality('low');
    } else {
      setQuality('medium');
    }
  }, []);

  return {
    level: quality,
    settings: QUALITY_MAP[quality],
  };
}
