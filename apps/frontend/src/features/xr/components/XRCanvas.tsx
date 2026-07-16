'use client';

import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { ReactNode } from 'react';
import { XR_QUALITY } from '../config/xr-config';

const store = createXRStore();

export function XRCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas
      dpr={XR_QUALITY.dpr}
      shadows={false}
      gl={{
        antialias: true,
        alpha: true,
        outputColorSpace: 'srgb',
        toneMapping: 3,
        toneMappingExposure: 1.2,
      }}
      camera={{
        fov: 60,
        near: 0.05,
        far: 100,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <XR store={store}>
        {children}
      </XR>
    </Canvas>
  );
}

export { store as xrStore };
