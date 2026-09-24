'use client';

import { Suspense, useRef, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import * as THREE from 'three';

const WARNING_COLOR = '#f97316';
const ERROR_COLOR = '#ef4444';
const SUCCESS_COLOR = '#22c55e';
const INFO_COLOR = '#3b82f6';

interface ARProjectionOverlayProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  environment?: 'floor' | 'wall' | 'table' | 'custom';
  showGrid?: boolean;
  showAxes?: boolean;
  className?: string;
  onPlacementChange?: (position: [number, number, number]) => void;
}

interface PlaneProps {
  width?: number;
  height?: number;
  color?: number;
}

function ARPlane({ width = 2, height = 1.5, color = 0x050505 }: PlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { reducedMotion } = useMotionPolicy();

  useFrame(() => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.x = -Math.PI / 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

interface ARAxesProps {
  size?: number;
}

function ARAxes({ size = 0.5 }: ARAxesProps) {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size, 8]} />
        <meshBasicMaterial color={COLOR_TOKENS.OBSIDIAN} />
      </mesh>
      <mesh position={[size / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size, 8]} />
        <meshBasicMaterial color={ERROR_COLOR} />
      </mesh>
      <mesh position={[-size / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size, 8]} />
        <meshBasicMaterial color={SUCCESS_COLOR} />
      </mesh>
    </group>
  );
}

function ARGrid({ size = 2, divisions = 5 }: { size?: number; divisions?: number }) {
  return (
    <gridHelper
      args={[size, divisions]}
    />
  );
}

interface EnvironmentPresetProps {
  preset?: 'floor' | 'wall' | 'table' | 'custom';
  rotation?: [number, number, number];
}

function AREnvironment({ preset = 'floor', rotation }: EnvironmentPresetProps) {
  const presetConfig: Record<string, { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = {
    floor: { position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0] },
    wall: { position: [0, 0, 0], rotation: [0, 0, 0] },
    table: { position: [0, 0, 0], rotation: [0, 0, 0] },
    custom: { position: [0, 0, 0], rotation: undefined },
  };

  const config = presetConfig[preset];

  return (
    <group position={config.position} rotation={rotation ?? config.rotation}>
      <ARPlane width={preset === 'table' ? 2 : 4} height={preset === 'table' ? 0.5 : (preset === 'floor' ? 4 : 2)} />
      {preset === 'wall' && <ARGrid size={2} />}
    </group>
  );
}

function StaticOverlay({ environment = 'floor', position, scale }: { environment: string; position?: [number, number, number]; scale?: number }) {
  const config: Record<string, { label: string; color: string }> = {
    floor: { label: 'AR Floor', color: SUCCESS_COLOR },
    wall: { label: 'AR Wall', color: WARNING_COLOR },
    table: { label: 'AR Table', color: INFO_COLOR },
    custom: { label: 'Custom AR', color: GOLD },
  };

  const cfg = config[environment as keyof typeof config] ?? config.custom;

  return (
    <div
      style={{
        padding: '1rem',
        background: COLOR_TOKENS.OBSIDIAN,
        borderRadius: '0.5rem',
        border: `1px solid ${cfg.color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.color }} />
        <span style={{ fontWeight: 500, color: '#f5f5f4' }}>{cfg.label} Overlay</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
        Position: ({position?.join(', ') ?? '0, 0, 0'})
      </div>
      <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
        Scale: {scale ?? 1}
      </div>
    </div>
  );
}

export function ARProjectionOverlay({
  position = [0, 0, 0],
  rotation,
  scale = 1,
  environment = 'floor',
  showGrid = true,
  showAxes = false,
  className,
  onPlacementChange,
}: ARProjectionOverlayProps) {
  const { animationsEnabled } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const [userPosition] = useState<[number, number, number]>(position);

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  const handleCreated = useCallback((state: RootState) => {
    registerContext(state);
  }, [registerContext]);

  useEffect(() => {
    if (onPlacementChange) {
      onPlacementChange(userPosition);
    }
  }, [userPosition, onPlacementChange]);

  if (!animationsEnabled) {
    return (
      <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
        <StaticOverlay environment={environment} position={position} scale={scale} />
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
          <p style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>AR overlay paused</p>
        </div>
      )}
      <Canvas
        dpr={[1, tier.maxDpr]}
        frameloop="always"
        onCreated={handleCreated}
        gl={{
          antialias: tier.antialias === 'msaa',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          <ambientLight intensity={0.1} />
          <Environment preset="warehouse" environmentIntensity={0.2} />
          <group position={position as unknown as [number, number, number]} scale={scale}>
            {showAxes && <ARAxes size={scale} />}
            {showGrid && <ARGrid size={scale * 2} />}
            <AREnvironment preset={environment} rotation={rotation} />
          </group>
        </Suspense>
      </Canvas>
      <div
        style={{
          position: 'absolute' as const,
          top: '1rem',
          left: '1rem',
          background: COLOR_TOKENS.OBSIDIAN,
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: `1px solid ${GOLD}`,
        }}
      >
        <span style={{ color: GOLD, fontSize: '0.75rem' }}>AR Projection</span>
      </div>
    </div>
  );
}

ARProjectionOverlay.displayName = 'ARProjectionOverlay';