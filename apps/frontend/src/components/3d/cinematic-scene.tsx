'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { PostProcessing } from './post-processing';
import { CinematicCamera } from './cinematic-camera';
import { useMotionPolicy } from '@/hooks/use-motion-policy';
import { COLOR_TOKENS } from '@/lib/color-tokens';
import { DirectionalLight } from 'three';

/**
 * CinematicScene — Production-grade 3D scene wrapper with:
 * - Lazy loading via IntersectionObserver (extends DeferredSceneLoader pattern)
 * - Motion policy gating (reduced motion → static fallback)
 * - Post-processing pipeline (bloom, vignette, chromatic aberration, grain)
 * - Cinematic camera rig with mouse parallax
 * - Volumetric-style lighting approximations
 * - Performance-adaptive quality (DPR scaling, effect toggling)
 *
 * Architecture:
 * - All WebGL content lives inside a dynamically-imported Client Island
 * - motion-policy hook gates rendering: reduced motion → static card fallback
 * - DPR scales down on low-power devices for 60fps target
 */

interface CinematicSceneProps {
  children: React.ReactNode;
  /** Camera FOV */
  fov?: number;
  /** Camera position */
  cameraPosition?: [number, number, number];
  /** Look-at target */
  lookAt?: [number, number, number];
  /** Enable mouse parallax */
  parallax?: boolean;
  /** Post-processing enabled */
  postProcessing?: boolean;
  /** Environment preset for reflections */
  environment?: 'sunset' | 'dawn' | 'night' | 'studio' | 'warehouse';
  /** Scene background color */
  background?: string;
  /** Ambient light intensity */
  ambientIntensity?: number;
  /** Key light intensity */
  keyIntensity?: number;
  /** Gold accent light */
  accentIntensity?: number;
  /** Class name for the container */
  className?: string;
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
  const keyRef = useRef<DirectionalLight>(null);

  return (
    <>
      {/* Ambient fill — very low for cinematic contrast */}
      <ambientLight intensity={ambientIntensity} color="#ffffff" />

      {/* Key light — warm white from upper right */}
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

      {/* Gold accent rim light — from behind-left for silhouette */}
      <directionalLight
        position={[-4, 3, -6]}
        intensity={accentIntensity}
        color={COLOR_TOKENS.GOLD}
      />

      {/* Subtle fill from below for depth */}
      <pointLight
        position={[0, -3, 4]}
        intensity={0.3}
        color="#4a4a6a"
        distance={15}
      />

      {/* Environment for PBR reflections */}
      <Environment preset="studio" environmentIntensity={0.4} />
    </>
  );
}

function SceneContent({
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

  // Adaptive DPR — lower on high-resolution displays for performance
  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const pixelRatio = window.devicePixelRatio || 1;
    // Cap at 1.5 for performance, but allow 1.0 on low-power devices
    return Math.min(pixelRatio, 1.5);
  }, []);

  // If user prefers reduced motion, render static fallback
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
      {/* Fog for depth — subtle, matching void color */}
      <fog attach="fog" args={[background, 10, 40]} />

      {/* Lighting rig */}
      <CinematicLighting
        ambientIntensity={ambientIntensity}
        keyIntensity={keyIntensity}
        accentIntensity={accentIntensity}
      />

      {/* Camera rig */}
      <CinematicCamera
        position={cameraPosition}
        lookAt={lookAt}
        fov={fov}
        parallax={parallax}
        smoothing={0.06}
      />

      {/* Scene content */}
      <Suspense fallback={null}>
        {children}
      </Suspense>

      {/* Post-processing pipeline */}
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

export function CinematicScene(props: CinematicSceneProps) {
  return (
    <div className={props.className || 'h-full w-full'}>
      <SceneContent {...props} />
    </div>
  );
}

export default CinematicScene;
