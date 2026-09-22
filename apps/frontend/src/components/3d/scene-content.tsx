'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { PostProcessing } from './post-processing';
import { CinematicCamera } from './cinematic-camera';
import { useMotionPolicy } from '@/hooks/use-motion-policy';
import { COLOR_TOKENS } from '@/lib/color-tokens';
import * as THREE from 'three';

interface CinematicSceneProps {
  children: React.ReactNode;
  fov?: number;
  cameraPosition?: [number, number, number];
  lookAt?: [number, number, number];
  parallax?: boolean;
  postProcessing?: boolean;
  environment?: 'sunset' | 'dawn' | 'night' | 'studio' | 'warehouse';
  background?: string;
  ambientIntensity?: number;
  keyIntensity?: number;
  accentIntensity?: number;
}

function CinematicLighting({
  ambientIntensity = 0.15,
  keyIntensity = 2.5,
  accentIntensity = 1.2,
}: {
  ambientIntensity?: number;
  keyIntensity?: number;
  accentIntensity?: number;
}) {
  const keyRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#ffffff" />
      <directionalLight
        ref={keyRef}
        position={[5, 8, 5]}
        intensity={keyIntensity}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight
        position={[-4, 3, -6]}
        intensity={accentIntensity}
        color={COLOR_TOKENS.GOLD}
      />
      <pointLight
        position={[0, -3, 4]}
        intensity={0.3}
        color="#4a4a6a"
        distance={15}
      />
      <Environment preset="studio" environmentIntensity={0.4} />
    </>
  );
}

export function SceneContent({
  children,
  fov = 45,
  cameraPosition = [0, 0, 8],
  lookAt = [0, 0, 0],
  parallax = true,
  postProcessing = true,
  environment: _environment = 'studio',
  background = COLOR_TOKENS.VOID,
  ambientIntensity = 0.15,
  keyIntensity = 2.5,
  accentIntensity = 1.2,
}: CinematicSceneProps) {
  const { shouldReduceMotion } = useMotionPolicy();

  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.min(pixelRatio, 1.5);
  }, []);

  if (shouldReduceMotion) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ backgroundColor: background }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-1 w-16"
            style={{ backgroundColor: COLOR_TOKENS.GOLD }}
          />
          <p className="text-sm uppercase tracking-[0.3em] text-sl-mist/40">
            3D Visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{ position: cameraPosition, fov, near: 0.1, far: 100 }}
      style={{ background }}
    >
      <fog attach="fog" args={[background, 10, 40]} />
      <CinematicLighting
        ambientIntensity={ambientIntensity}
        keyIntensity={keyIntensity}
        accentIntensity={accentIntensity}
      />
      <CinematicCamera
        position={cameraPosition}
        lookAt={lookAt}
        fov={fov}
        parallax={parallax}
        smoothing={0.06}
      />
      <Suspense fallback={null}>
        {children}
      </Suspense>
      <PostProcessing
        bloomIntensity={0.35}
        bloomThreshold={0.55}
        vignetteIntensity={0.4}
        noiseOpacity={0.035}
        enabled={postProcessing}
      />
    </Canvas>
  );
}
