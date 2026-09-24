'use client';

import { Suspense, useRef, useCallback, useState } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
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

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5 * scale, tier.level === 'high' ? 64 : tier.level === 'medium' ? 32 : 16, 32]} />
      <MeshDistortMaterial
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={envMapIntensity}
        clearcoat={clearcoat}
        color={material.color}
        distort={0.02}
      />
    </mesh>
  );
}

function MaterialsGrid({ onSelect: _onSelect, activePreset }: { onSelect?: (preset: MaterialPresetName) => void; activePreset?: MaterialPresetName }) {
  return (
    <group position={[-3, 0, 0]}>
      {PRESET_ORDER.map((preset) => (
        <PresetSphere key={preset} preset={preset} scale={1.2} rotating />
      ))}
    </group>
  );
}

const STATIC_PRESET_STYLES = {
  container: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', padding: '1rem' },
  label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#f5f5f4' },
  button: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid',
    borderColor: active ? GOLD : '#374151',
    backgroundColor: active ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
    cursor: 'pointer' as const,
    transition: 'all 0.1s',
  }),
  colorSwatch: { width: '1rem', height: '1rem', borderRadius: '0.25rem' },
  presetName: { fontSize: '0.75rem', fontWeight: 400, color: '#f5f5f4' },
  activeBadge: { fontSize: '0.625rem', color: GOLD },
};

function StaticMaterialPresets({ activePreset, onSelect }: { activePreset?: MaterialPresetName; onSelect?: (preset: MaterialPresetName) => void }) {
  return (
    <div style={STATIC_PRESET_STYLES.container}>
      <div style={STATIC_PRESET_STYLES.label}>Material Presets</div>
      {PRESET_ORDER.map((preset) => (
        <button
          key={preset}
          onClick={() => onSelect?.(preset)}
          style={STATIC_PRESET_STYLES.button(activePreset === preset)}
        >
          <div style={{ ...STATIC_PRESET_STYLES.colorSwatch, backgroundColor: PRESET_PREVIEW_COLORS[preset] }} />
          <span style={STATIC_PRESET_STYLES.presetName}>{PRESET_LABELS[preset]}</span>
          {activePreset === preset && <span style={STATIC_PRESET_STYLES.activeBadge}>Active</span>}
        </button>
      ))}
    </div>
  );
}

export function MaterialPresetLibrary({
  activePreset = 'obsidian_marble',
  onPresetChange: _onPresetChange,
  showLibrary: _showLibrary,
  onSelect: _onSelect,
  className,
  position = [0, 0, 5],
  scale: _scale = 1,
}: MaterialPresetLibraryProps) {
  const { animationsEnabled } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  const handleCreated = useCallback((state: RootState) => {
    registerContext(state);
  }, [registerContext]);

  if (!animationsEnabled) {
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
          style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLOR_TOKENS.OBSIDIAN }}
        >
          <p style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>3D materials paused</p>
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