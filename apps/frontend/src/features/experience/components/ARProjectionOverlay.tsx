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

interface ARProjectionOverlayProps {
  targetObject?: {
    type: 'cube' | 'sphere' | 'plane';
    position?: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
    color?: string;
  };
  projectionType?: 'orthographic' | 'perspective';
  showGrid?: boolean;
  showAxes?: boolean;
  showMeasurements?: boolean;
  arMode?: boolean;
  className?: string;
  onProjectionUpdate?: (data: ProjectionData) => void;
}

interface ProjectionData {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

const GRID_SIZE = 5;
const GRID_DIVISIONS = 10;

function TargetObject({ target }: { target: ARProjectionOverlayProps['targetObject'] }) {
  const { reducedMotion } = useMotionPolicy();
  const meshRef = useRef<THREE.Mesh>(null);

  if (!target) return null;

  const { type, position = [0, 0, 0], scale: objScale = 1, rotation = [0, 0, 0], color = COLOR_TOKENS.GOLD } = target;

  useFrame(() => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  switch (type) {
    case 'cube':
      return (
        <mesh ref={meshRef} position={position} rotation={rotation as THREE.EulerRotation | [number, number, number]}>
          <boxGeometry args={[objScale, objScale, objScale]} />
          <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
      );
    case 'sphere':
      return (
        <mesh ref={meshRef} position={position}>
          <sphereGeometry args={[objScale / 2, 64, 64]} />
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
        </mesh>
      );
    case 'plane':
      return (
        <mesh ref={meshRef} position={position} rotation={rotation as THREE.EulerRotation | [number, number, number]}>
          <planeGeometry args={[objScale, objScale]} />
          <meshPhysicalMaterial color={color} side={THREE.DoubleSide} metalness={0.7} roughness={0.3} />
        </mesh>
      );
    default:
      return null;
  }
}

function ProjectionGrid() {
  const gridRef = useRef<THREE.Group>(null);

  return (
    <group ref={gridRef}>
      <gridHelper args={[GRID_SIZE, GRID_DIVISIONS, GOLD, GOLD]} />
    </group>
  );
}

function AxesHelper() {
  return (
    <group>
      <arrowHelper args={['red', [-GRID_SIZE / 2, 0, 0], GRID_SIZE / 2]} />
      <arrowHelper args={['green', [0, -GRID_SIZE / 2, 0], GRID_SIZE / 2]} />
      <arrowHelper args={['blue', [0, 0, -GRID_SIZE / 2], GRID_SIZE / 2]} />
    </group>
  );
}

function MeasurementsOverlay({ position }: { position: [number, number, number] }) {
  return (
    <Html position={position} center className="pointer-events-none">
      <div className="text-xs text-gold-ink bg-obsidian/70 px-2 py-1 rounded border border-gold">
        <div>X: {position[0].toFixed(2)}</div>
        <div>Y: {position[1].toFixed(2)}</div>
        <div>Z: {position[2].toFixed(2)}</div>
      </div>
    </Html>
  );
}

enum ARButtonState {
  NOT_SUPPORTED,
  INITIALIZING,
  ACTIVE,
  AR_MODE,
}

function ARButton({ arMode, onEnable }: { arMode: boolean; onEnable: () => void }) {
  const [state, setState] = useState<ARButtonState>(ARButtonState.NOT_SUPPORTED);
  const [xrSupported, setXrSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator.xr === 'undefined') {
      setState(ARButtonState.NOT_SUPPORTED);
      return;
    }

    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
      setXrSupported(supported);
      if (supported && arMode) {
        setState(ARButtonState.ACTIVE);
      } else if (!arMode) {
        setState(ARButtonState.ACTIVE);
      } else {
        setState(ARButtonState.NOT_SUPPORTED);
      }
    });
  }, [arMode]);

  useEffect(() => {
    if (arMode && xrSupported && state === ARButtonState.ACTIVE) {
      setState(ARButtonState.AR_MODE);
      onEnable();
    }
  }, [arMode, xrSupported, state, onEnable]);

  if (!xrSupported) {
    return null;
  }

  const handleClick = async () => {
    if (typeof navigator.xr === 'undefined') return;

    if (arMode) {
      setState(ARButtonState.INITIALIZING);
      try {
        const session = await navigator.xr.requestSession('immersive-ar');
        if (session) {
          setState(ARButtonState.AR_MODE);
          onEnable();
        }
      } catch {
        setState(ARButtonState.ACTIVE);
      }
    } else {
      setState(ARButtonState.ACTIVE);
    }
  };

  return (
    <Html position={[0, 2, 0]} center className="pointer-events-none">
      <button
        onClick={handleClick}
        disabled={state === ARButtonState.INITIALIZING}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          state === ARButtonState.AR_MODE
            ? 'bg-green-500/70 cursor-default'
            : 'bg-gold/20 hover:bg-gold/40 cursor-pointer'
        } text-gold border border-gold`}
      >
        {state === ARButtonState.AR_MODE ? 'AR Active' : state === ARButtonState.INITIALIZING ? 'Initializing...' : 'Enable AR'}
      </button>
    </Html>
  );
}

function StaticProjection({ target, showGrid, showAxes, showMeasurements }: {
  target: ARProjectionOverlayProps['targetObject'];
  showGrid: boolean;
  showAxes: boolean;
  showMeasurements: boolean;
}) {
  if (!target) return null;

  const { position = [0, 0, 0] } = target;

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-bold text-slate-200 mb-2">AR Projection</h3>
      <div className="text-xs text-slate-400 space-y-1">
        <div>Position: ({position.join(', ')})</div>
        <div>Projection Type: Perspective</div>
        <div>AR Mode: {showGrid ? 'Enabled' : 'Disabled'}</div>
      </div>
      {showGrid && (
        <div className="mt-2 p-2 bg-obsidian/30 rounded border border-gold/20">
          <div className="text-gold text-xs mb-1">Grid Overlay</div>
          <div className="text-slate-300 text-[10px]">5m x 5m grid with 10 divisions</div>
        </div>
      )}
      {showAxes && (
        <div className="mt-2 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" title="X Axis" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" title="Y Axis" />
          <div className="w-3 h-3 rounded-full bg-blue-500/50" title="Z Axis" />
        </div>
      )}
    </div>
  );
}

export function ARProjectionOverlay({
  targetObject,
  projectionType = 'perspective',
  showGrid = true,
  showAxes = true,
  showMeasurements = true,
  arMode = false,
  className,
  onProjectionUpdate,
}: ARProjectionOverlayProps) {
  const { shouldReduceMotion } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const [projectionData, setProjectionData] = useState<ProjectionData | null>(null);

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  useEffect(() => {
    if (projectionData && onProjectionUpdate) {
      onProjectionUpdate(projectionData);
    }
  }, [projectionData, onProjectionUpdate]);

  const handleCreated = useCallback((state: any) => {
    registerContext(state);
    if (targetObject?.position) {
      setProjectionData({
        position: targetObject.position,
        scale: [1, 1, 1],
        rotation: targetObject.rotation ?? [0, 0, 0],
        bounds: [
          [targetObject.position[0] - 0.5, targetObject.position[1] - 0.5, targetObject.position[2] - 0.5],
          [targetObject.position[0] + 0.5, targetObject.position[1] + 0.5, targetObject.position[2] + 0.5],
        ],
      });
    }
  }, [registerContext, targetObject]);

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
        <StaticProjection
          target={targetObject}
          showGrid={showGrid}
          showAxes={showAxes}
          showMeasurements={showMeasurements}
        />
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
          <p className="text-slate-400 text-xs">AR projection paused</p>
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
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <Environment preset="studio" environmentIntensity={0.3} />
          {targetObject && <TargetObject target={targetObject} />}
          {showGrid && <ProjectionGrid />}
          {showAxes && <AxesHelper />}
          {showMeasurements && targetObject?.position && (
            <MeasurementsOverlay position={targetObject.position} />
          )}
          <ARButton arMode={arMode} onEnable={() => {}} />
        </Suspense>
      </Canvas>
    </div>
  );
}

ARProjectionOverlay.displayName = 'ARProjectionOverlay';