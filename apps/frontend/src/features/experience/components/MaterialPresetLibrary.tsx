'use client';

import { Suspense, useRef, useCallback, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, MeshDistortableMaterial } from '@react-three/drei';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import { MATERIAL_PRESETS } from '@/features/scene/config/material-presets';
import * as THREE from 'three';

export type MaterialPresetName = keyof typeof MATERIAL_PRESETS;

const PRESET_PREVIEW_COLORS: Record<MaterialPresetName, string> = {
  obsidian_marble: '#121212',
  warm_oak: '#8b5a2b',
  brushed_titanium: '#8a8a8e',
  raw_concrete: '#5a5a5a',
};

const PRESET_LABELS: Record<MaterialPresetName, string> = {
  obsidian_marble: 'Obsidian Polished Marble',
  warm_oak: 'Warm Oak Timber',
  brushed_titanium: 'Brushed Titanium',
  raw_concrete: 'Raw Architectural Concrete',
};

interface MaterialPresetLibraryProps {
  activePreset?: MaterialPresetName;
  onPresetChange?: (preset: MaterialPresetName) => void;
  showLibrary?: boolean;
  onSelect?: (preset: MaterialPresetName) => void;
  className?: string;
  position?: [number, number, number];
  scale?: number;
}

const PRESET_ORDER: MaterialPresetName[] = ['obsidian_marble', 'warm_oak', 'brushed_titanium', 'raw_concrete'];

type CanvasState = {
  gl: THREE.WebGLRenderer;
  camera: THREE.Camera;
  scene: THREE.Scene;
};

function PresetSphere({ preset, scale = 1, rotating = true }: { preset: MaterialPresetName; scale?: number; rotating?: boolean }) {
  const { tier } = useQualityTier();
  const material = MATERIAL_PRESETS[preset];
  const meshRef = useRef<THREE.Mesh>(null);
  const { reducedMotion } = useMotionPolicy();

  useFrame(() => {
    if (meshRef.current && rotating && !reducedMotion) {
      meshRef.current.rotation.y += 0.01 * (tier.level === 'high' ? 1 : tier.level === 'medium' ? 0.5 : 0.2);
    }
  });

  const roughness = material.roughness * (tier.level === 'high' ? 1 : tier.level === 'medium' ? 0.8 : 0.5);
  const metalness = material.metalness * (tier.level === 'high' ? 1 : tier.level === 'medium' ? 0.7 : 0.3);
  const envMapIntensity = material.envMapIntensity * (tier.level === 'high' ? 1 : tier.level === 'medium' ? 0.8 : 0.5);
  const clearcoat = material.clearcoat * (tier.level === 'high' ? 1 : tier.level === 'medium' ? 0.7 : 0.3);
  const distortion = material.clearcoat > 0 ? 0.02 : 0;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5 * scale, tier.level === 'high' ? 64 : tier.level === 'medium' ? 32 : 16, 32]} />
      <MeshDistortableMaterial
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={envMapIntensity}
        clearcoat={clearcoat}
        color={material.color}
        distortions={distortion}
      />
    </mesh>
  );
}

function MaterialsGrid({ onSelect, activePreset }: { onSelect?: (preset: MaterialPresetName) => void; activePreset?: MaterialPresetName }) {
  return (
    <group position={[-3, 0, 0]}>
      {PRESET_ORDER.map((preset) => (
        <PresetSphere key={preset} preset={preset} scale={1.2} rotating />
      ))}
    </group>
  );
}

function StaticMaterialPresets({ activePreset, onSelect }: { activePreset?: MaterialPresetName; onSelect?: (preset: MaterialPresetName) => void }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-bold text-slate-200 mb-2">Material Presets</h3>
      {PRESET_ORDER.map((preset) => (
        <button
          key={preset}
          onClick={() => onSelect?.(preset)}
          className={`w-full p-2 rounded-lg border text-left transition-all ${
            activePreset === preset
              ? 'border-gold-ink bg-gold-subtle/20'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PRESET_PREVIEW_COLORS[preset] }} />
            <span className="text-xs font-medium text-slate-200">{PRESET_LABELS[preset]}</span>
          </div>
          {activePreset === preset && <span className="ml-auto text-xs text-gold-ink">Active</span>}
        </button>
      ))}
    </div>
  );
}

export function MaterialPresetLibrary({
  activePreset = 'obsidian_marble',
  onPresetChange,
  showLibrary = true,
  onSelect,
  className,
  position = [0, 0, 5],
  scale = 1,
}: MaterialPresetLibraryProps) {
  const { shouldReduceMotion } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  const handleCreated = useCallback((self: CanvasState) => {
    registerContext(self.gl);
  }, [registerContext]);

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
        <StaticMaterialPresets activePreset={activePreset} onSelect={onSelect} />
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
          <p className="text-slate-400 text-xs">3D materials paused</p>
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
          <PerspectiveCamera makeDefault position={position} fov={50} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <Environment preset="studio" environmentIntensity={0.4} />
          <MaterialsGrid onSelect={onSelect} activePreset={activePreset} />
        </Suspense>
      </Canvas>
    </div>
  );
}

MaterialPresetLibrary.displayName = 'MaterialPresetLibrary';