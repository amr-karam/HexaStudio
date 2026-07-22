'use client';

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  PerspectiveCamera,
  ContactShadows,
  Environment,
} from '@react-three/drei';

import { SceneContent } from './SceneContent';
import { CameraController } from './CameraController';
const PostProcessing = lazy(() => import('./PostProcessing').then((module) => ({ default: module.PostProcessing })));
import { SceneAccessibility } from './SceneAccessibility';
import { Color } from 'three';
import { useQualityTier } from '@/providers/quality-provider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ProjectHotspot } from '@hexastudio/types';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanupContextRef = useRef<(() => void) | null>(null);

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
    };
  }, []);

  // Webglcontextlost / restored.
  const handleCreated = React.useCallback(
    (state: { gl: { domElement: HTMLCanvasElement; setClearColor: (color: Color) => void } }) => {
      canvasRef.current = state.gl.domElement;

      const onContextLost = (e: Event) => {
        e.preventDefault();
        setIsVisible(false);
      };
      const onContextRestored = () => {
        setIsVisible(true);
      };

      state.gl.domElement.addEventListener('webglcontextlost', onContextLost);
      state.gl.domElement.addEventListener('webglcontextrestored', onContextRestored);

      cleanupContextRef.current = () => {
        state.gl.domElement.removeEventListener('webglcontextlost', onContextLost);
        state.gl.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      };
    },
    [],
  );

  // Don't mount Canvas if WebGL is unavailable.
  if (!webglSupported) {
    return (
      <div className="absolute inset-0 -z-10 flex items-center justify-center bg-[#050505]">
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
      {isVisible && (
        <Canvas
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

            <Environment preset="warehouse" />
            <SceneContent projectModelUrl={projectModelUrl} hotspots={hotspots} status={status} milestones={milestones} />

            {/* Key light — crisp white from upper right. */}
            <directionalLight
              position={[8, 12, 4]}
              intensity={2}
              color="#ffffff"
              castShadow={tier.shadows}
              shadow-mapSize={[tier.shadowMapSize, tier.shadowMapSize]}
              shadow-bias={-0.0001}
            />
            {/* Warm gold fill from the opposite side. */}
            <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#D4AF37" />
            {/* Cool blue rim light for separation. */}
            <directionalLight position={[0, 6, -8]} intensity={0.6} color="#7BA7FF" />
            {/* Overhead spotlight. */}
            <spotLight
              position={[0, 15, 0]}
              angle={0.4}
              penumbra={1}
              intensity={0.5}
              color="#ffffff"
              castShadow={tier.shadows}
            />

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
