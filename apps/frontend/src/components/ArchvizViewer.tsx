'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, useProgress } from '@react-three/drei'
import { Suspense, type ReactNode } from 'react'
import * as THREE from 'three'
import type { ScenePreset } from '@/lib/presets/SeasonPresetLibrary'

interface ArchvizViewerProps {
  preset?: ScenePreset
  children?: ReactNode
}

/**
 * Loader component shown while the 3D canvas initializes.
 * Styled with HEXA Studio design tokens.
 */
function ArchvizLoader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-sl-alabaster">
        <div className="w-8 h-8 border-2 border-sl-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-sl-muted">
          Loading… {Math.round(progress)}%
        </span>
      </div>
    </Html>
  )
}

/**
 * ArchvizViewer — production-grade real-time 3D architectural viewer.
 *
 * Features:
 * - OrbitControls for interactive navigation
 * - Environment lighting (HDR) via drei
 * - ContactShadows for ground contact realism
 * - Configurable via ScenePreset (seasonal lighting/fog/material overrides)
 * - Reduced-motion accessibility gate
 */
export default function ArchvizViewer({ preset, children }: ArchvizViewerProps) {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // Cap DPR on desktop PCs: 2x causes GPU stalls on integrated graphics.
  // 1.5x is visually identical for archviz but ~40% fewer pixels to shade.
  const dpr: [number, number] = prefersReduced ? [1, 1] : [1, 1.5]

  return (
    <Canvas
      camera={{ position: [0, 1.7, 5], fov: preset?.camera.fov ?? 65 }}
      gl={{
        antialias: true,
        alpha: true,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      dpr={dpr}
      frameloop={prefersReduced ? 'demand' : 'always'}
      shadows={!prefersReduced}
      onCreated={({ gl }) => {
        // sRGB output + ACES tone mapping = correct colors on PC monitors.
        // Without this, materials look washed out / overly dark on Windows.
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
    >
      <Suspense fallback={<ArchvizLoader />}>
        {/* Environment — HDR lighting preset from seasonal config */}
        {preset && (
          <Environment preset={preset.environment.preset as "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse"} />
        )}

        {/* Ambient light — colored per preset */}
        {preset && (
          <ambientLight
            color={preset.lighting.ambientColor}
            intensity={preset.lighting.ambientIntensity}
          />
        )}

        {/* Directional light — sun direction from preset */}
        {preset && (
          <directionalLight
            color={preset.lighting.directionalColor}
            intensity={preset.lighting.directionalIntensity}
            position={preset.lighting.directionalPosition}
            castShadow={!prefersReduced}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        )}

        {/* Hemisphere light — sky tint */}
        {preset && (
          <hemisphereLight
            color={preset.lighting.hemisphereColor}
            intensity={preset.lighting.hemisphereIntensity}
            groundColor={preset.lighting.ambientColor}
          />
        )}

        {/* Contact shadows for ground contact realism — skipped on reduced-motion PCs */}
        {!prefersReduced && (
          <ContactShadows
            position={[0, -0.001, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={5}
            frames={Infinity}
          />
        )}

        {/* Reduced-motion gate: skip OrbitControls if user prefers reduced motion */}
        {!prefersReduced && <OrbitControls enablePan={false} />}

        {/* Child content — typically ArchvizModel */}
        {children}
      </Suspense>
    </Canvas>
  )
}