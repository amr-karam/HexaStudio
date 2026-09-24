'use client';

import { Suspense, useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Html } from '@react-three/drei';
import type { QualityTier } from '@/providers/quality-provider';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import * as THREE from 'three';

interface AudioSource {
  id: string;
  position: [number, number, number];
  name: string;
  volume?: number;
  maxDistance?: number;
}

interface SpatialAudioProfilerProps {
  audioSources?: AudioSource[];
  listenerPosition?: [number, number, number];
  showSphere?: boolean;
  showDecibels?: boolean;
  className?: string;
  onAudioLevelChange?: (levels: Record<string, number>) => void;
}

const DECIBEL_MIN = -60;
const DECIBEL_MAX = 0;

interface SoundSphereProps {
  position: [number, number, number];
  name: string;
  volume: number;
  maxDistance: number;
}

function SoundSphere({ position, name, volume, maxDistance }: SoundSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { reducedMotion } = useMotionPolicy();

  const db = THREE.MathUtils.mapLinear(volume, 0, 1, DECIBEL_MIN, DECIBEL_MAX);
  const hue = THREE.MathUtils.mapLinear(volume, 0, 1, 0, 0.3);
  const saturation = THREE.MathUtils.mapLinear(volume, 0, 1, 0, 1);

  useFrame(() => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={`hsl(${hue}, ${saturation * 100}%, 50%)`} transparent opacity={0.8} />
      </mesh>
      {showDecibels && (
        <Html
          position={[0, 0.3, 0]}
          center
          className="pointer-events-none"
          style={{ color: 'white', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: 2 }}
        >
          {name}: {db.toFixed(0)}dB
        </Html>
      )}
    </group>
  );
}

function ListenerSphere({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <Html position={[0, -0.3, 0]} center className="pointer-events-none" style={{ color: GOLD, fontSize: '10px' }}>
        You
      </Html>
    </group>
  );
}

interface AudioVisualizerProps {
  levels: Record<string, number>;
  sources: AudioSource[];
}

function AudioVisualizer({ levels, sources }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4 left-4 bg-obsidian/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-200"
    >
      <div className="font-bold mb-2">Audio Levels</div>
      {sources.map((source) => (
        <div key={source.id} className="mb-1">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-slate-400">{source.name}</span>
            <span>{levels[source.id]?.toFixed(0) ?? '-inf'}dB</span>
          </div>
          <div className="h-1 bg-slate-700 rounded overflow-hidden">
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${Math.max(0, Math.min(100, (levels[source.id] ?? -60 + 60) / 60 * 100))}%`,
                backgroundColor: levels[source.id] ? GOLD : COLOR_TOKENS.SURFACE,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StaticAudioVisualizer({ sources }: { sources: AudioSource[] }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-bold text-slate-200 mb-2">Spatial Audio Sources</h3>
      {sources.map((source) => (
        <div key={source.id} className="p-2 bg-obsidian/50 rounded border border-slate-700">
          <div className="font-medium text-slate-100">{source.name}</div>
          <div className="text-xs text-slate-400">
            Position: ({source.position.join(', ')})
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpatialAudioProfiler({
  audioSources = [],
  listenerPosition = [0, 0, 0],
  showSphere = true,
  showDecibels = true,
  className,
  onAudioLevelChange,
}: SpatialAudioProfilerProps) {
  const { shouldReduceMotion } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const [levels, setLevels] = useState<Record<string, number>>({});

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  useEffect(() => {
    if (onAudioLevelChange) {
      onAudioLevelChange(levels);
    }
  }, [levels, onAudioLevelChange]);

  const handleCreated = useCallback((state: any) => {
    registerContext(state);
  }, [registerContext]);

  if (!showSphere || shouldReduceMotion) {
    return (
      <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
        <StaticAudioVisualizer sources={audioSources} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
      {contextLost && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center bg-obsidian"
        >
          <p className="text-slate-400 text-xs">3D audio paused</p>
        </div>
      )}
      <Canvas
        dpr={[1, tier.maxDpr]}
        frameloop="always"
        onCreated={handleCreated}
        gl={{
          antialias: tier.antialias === 'msaa',
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background: COLOR_TOKENS.VOID }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          <ambientLight intensity={0.2} />
          <Environment preset="studio" environmentIntensity={0.3} />
          {audioSources.map((source) => (
            <SoundSphere
              key={source.id}
              position={source.position}
              name={source.name}
              volume={source.volume ?? 0.5}
              maxDistance={source.maxDistance ?? 10}
            />
          ))}
          <ListenerSphere position={listenerPosition} />
        </Suspense>
      </Canvas>
      <AudioVisualizer levels={levels} sources={audioSources} />
    </div>
  );
}

SpatialAudioProfiler.displayName = 'SpatialAudioProfiler';

export { SpatialAudioProfiler };