'use client';

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import {
  PerspectiveCamera,
  ContactShadows,
  Environment,
} from '@react-three/drei';

import { SceneContent } from './SceneContent';
import { CameraController } from './CameraController';
const PostProcessing = lazy(() => import('./PostProcessing').then((module) => ({ default: module.PostProcessing })));
import { SceneAccessibility } from './SceneAccessibility';
import { useQualityTier } from '@/providers/quality-provider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import { ProjectHotspot } from '@hexastudio/types';
import { useDesignerStore } from '../store/designer-store';
import { LIGHTING_PRESETS } from '../config/lighting-presets';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ExperienceCanvasProps {
  projectModelUrl?: string;
  hotspots?: ProjectHotspot[];
  projectTitle?: string;
  status?: string;
  milestones?: { total: number; completed: number };
}

/* -------------------------------------------------------------------------- */
/*  Fallback                                                                   */
/* -------------------------------------------------------------------------- */

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1A1A1A" wireframe />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  WebGL detection                                                            */
/* -------------------------------------------------------------------------- */

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return true; // assume yes on server.
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Lighting rig                                                               */
/* -------------------------------------------------------------------------- */

/**
 * SceneLightingRig renders the full light rig from the active designer-store
 * lighting preset. Every light (ambient, key, fill, rim, spotlight) and the
 * environment reflection intensity derive from `LIGHTING_PRESETS`, so switching
 * presets in DesignerModeConfigurator is reflected live in the 3D scene.
 *
 * Accessibility: purely static — no animation is introduced, so the rig is
 * safe under `prefers-reduced-motion` and the motion:disabled site policy.
 */
function SceneLightingRig() {
  const activeLighting = useDesignerStore((state) => state.activeLighting);
  const lighting = LIGHTING_PRESETS[activeLighting];
  const { tier } = useQualityTier();

  return (
    <>
      <Environment preset="warehouse" environmentIntensity={lighting.envIntensity} />

      {/* Base ambient illumination from the preset. */}
      <ambientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />

      {/* Key light — preset-driven, crisp, casts shadows. */}
      <directionalLight
        position={lighting.directionalPosition}
        intensity={lighting.directionalIntensity}
        color={lighting.directionalColor}
        castShadow={tier.shadows}
        shadow-mapSize={[tier.shadowMapSize, tier.shadowMapSize]}
        shadow-bias={-0.0001}
      />
      {/* Warm gold fill from the opposite side — tinted by the preset. */}
      <directionalLight
        position={[-6, 4, -4]}
        intensity={lighting.directionalIntensity * 0.25}
        color={lighting.directionalColor}
      />
      {/* Cool rim light for separation — tinted by the preset. */}
      <directionalLight
        position={[0, 6, -8]}
        intensity={lighting.directionalIntensity * 0.35}
        color={lighting.directionalColor}
      />
      {/* Overhead spotlight — intensified for the gallery presentation preset. */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.4}
        penumbra={1}
        intensity={activeLighting === 'gallery' ? 1.6 : lighting.directionalIntensity * 0.35}
        color={lighting.directionalColor}
        castShadow={tier.shadows}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export const ExperienceCanvas = ({
  projectModelUrl,
  hotspots,
  projectTitle,
  status,
  milestones,
}: ExperienceCanvasProps) => {
  const { tier } = useQualityTier();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanupContextRef = useRef<(() => void) | null>(null);

  // WebGL context-loss recovery: pause the render loop on loss (never unmount),
  // and on restore remount the Canvas via `restartKey` so a fresh context is
  // created. This closes the post-context-loss render race that otherwise lets
  // three.js compile programs against dead GL handles (getProgramParameter).
  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setRestartKey((key) => key + 1),
  });

  // Pre-mount WebGL detection.
  useEffect(() => {
    setWebglSupported(hasWebGL());
  }, []);

  // IntersectionObserver: pause rendering when offscreen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause on document hidden.
  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Cleanup WebGL context listeners on unmount.
  useEffect(() => {
    return () => {
      cleanupContextRef.current?.();
      cleanupContextRef.current = null;
    };
  }, []);

  // Webglcontextlost / restored.
  const handleCreated = React.useCallback(
    (state: RootState) => {
      canvasRef.current = state.gl.domElement;
      cleanupContextRef.current = registerContext(state);
      // A fresh context is live: hide the static fallback overlay.
      setContextLost(false);
    },
    [registerContext],
  );

  // Don't mount Canvas if WebGL is unavailable.
  if (!webglSupported) {
    return (
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-obsidian">
        <div className="text-center max-w-md px-6">
          <h3 className="text-white/60 text-sm uppercase tracking-widest mb-2">
            3D Scene Unavailable
          </h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            WebGL is not supported in this browser. Please try a different browser.
          </p>
        </div>
      </div>
    );
  }

  // Determine antialiasing strategy — choose ONE.
  const glAntialias = tier.antialias === 'msaa'
    ? true
    : tier.antialias === 'smaa'
      ? false // SMAA is handled by postprocessing
      : false;

  // Under reduced motion: use frameloop demand (render once).
  const frameloop = reducedMotion ? 'demand' : undefined;

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 h-full w-full" data-cursor="drag">
      <SceneAccessibility hotspots={hotspots} projectTitle={projectTitle} />
      {/* Static fallback while the WebGL context is lost. The Canvas stays
          mounted (loop paused) so the scene can resume cleanly on restore;
          the overlay is non-interactive and announces the state to AT. */}
      {contextLost && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-obsidian"
        >
          <p className="text-neutral-400 text-xs uppercase tracking-widest">
            3D experience paused
          </p>
        </div>
      )}
      {isVisible && (
        <Canvas
          key={restartKey}
          shadows={tier.shadows}
          dpr={[1, tier.maxDpr]}
          frameloop={frameloop}
          onCreated={handleCreated}
          gl={{
            antialias: glAntialias,
            powerPreference: 'high-performance',
            toneMapping: 4, // ACESFilmicToneMapping
            toneMappingExposure: 1.2,
          }}
        >
          <Suspense fallback={<SceneFallback />}>
            <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={45} />
            <CameraController />

            <SceneLightingRig />
            <SceneContent projectModelUrl={projectModelUrl} hotspots={hotspots} status={status} milestones={milestones} />

            <fog attach="fog" args={['#050505', 12, 35]} />

            {/* ContactShadows: gated by quality tier. */}
            {tier.contactShadows && (
              <ContactShadows
                position={[0, -0.01, 0]}
                opacity={tier.level === 'medium' ? 0.35 : 0.5}
                scale={25}
                blur={tier.level === 'medium' ? 3 : 4}
                far={15}
              />
            )}

            <Suspense fallback={null}>
              <PostProcessing />
            </Suspense>
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export type { ExperienceCanvasProps };
