'use client';

import { Suspense, useRef, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Html } from '@react-three/drei';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import * as THREE from 'three';

type CanvasState = {
  gl: THREE.WebGLRenderer;
  camera: THREE.Camera;
  scene: THREE.Scene;
};

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

function SoundSphere({ position, name, volume, maxDistance, showDecibels }: SoundSphereProps & { showDecibels?: boolean }) {
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

const VISUALIZER_STYLE = {
  background: 'rgba(15, 15, 16, 0.8)',
  border: 'rgba(76, 76, 82, 0.5)',
  text: '#e4e4e8',
  textSecondary: '#a0a0a0',
  divider: '#374151',
};

function AudioVisualizer({ levels, sources }: AudioVisualizerProps) {
  return (
    <div
      style={{
        position: 'absolute' as const,
        bottom: '1rem',
        left: '1rem',
        background: VISUALIZER_STYLE.background,
        border: `1px solid ${VISUALIZER_STYLE.divider}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        fontSize: '0.75rem',
        color: VISUALIZER_STYLE.text,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Audio Levels</div>
      {sources.map((source) => (
        <div key={source.id} style={{ marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: VISUALIZER_STYLE.textSecondary }}>{source.name}</span>
            <span>{levels[source.id]?.toFixed(0) ?? '-inf'}dB</span>
          </div>
          <div style={{ height: '0.25rem', background: VISUALIZER_STYLE.divider, borderRadius: '0.25rem', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.max(0, Math.min(100, ((levels[source.id] ?? -60) + 60) / 60 * 100))}%`,
                backgroundColor: levels[source.id] ? GOLD : COLOR_TOKENS.SURFACE,
                transition: 'width 0.1s',
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
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f5f5f4', marginBottom: '0.5rem' }}>Spatial Audio Sources</h3>
      {sources.map((source) => (
        <div key={source.id} style={{ padding: '0.5rem', background: COLOR_TOKENS.OBSIDIAN, borderRadius: '0.25rem', border: '1px solid rgba(76, 76, 82, 0.5)' }}>
          <div style={{ fontWeight: 500, color: '#f5f5f4' }}>{source.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
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

  const handleCreated = useCallback((self: CanvasState) => {
    registerContext(self.gl);
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
          style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLOR_TOKENS.OBSIDIAN }}
        >
          <p style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>3D audio paused</p>
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
              showDecibels={showDecibels}
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