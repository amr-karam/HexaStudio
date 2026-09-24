'use client';

import { Suspense, useRef, useCallback, useState } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows, Html } from '@react-three/drei';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import { LIGHTING_PRESETS } from '@/features/scene/config/lighting-presets';
import * as THREE from 'three';

type EnvironmentPreset = 'sunset' | 'dawn' | 'night' | 'studio' | 'warehouse' | 'city' | 'apartment' | 'forest' | 'lobby' | 'park';

interface CinematicStorytellerProps {
  title?: string;
  subtitle?: string;
  background?: string;
  environment?: EnvironmentPreset;
  className?: string;
}

const ENVIRONMENT_PRESET_MAP: Record<EnvironmentPreset, keyof typeof LIGHTING_PRESETS> = {
  sunset: 'daylight',
  dawn: 'golden_hour',
  night: 'cyberpunk',
  studio: 'daylight',
  warehouse: 'gallery',
  city: 'daylight',
  apartment: 'daylight',
  forest: 'golden_hour',
  lobby: 'gallery',
  park: 'sunset',
};

function CinematicLighting({ environment = 'studio' }: { environment?: EnvironmentPreset }) {
  const { tier } = useQualityTier();
  const lightingPreset = ENVIRONMENT_PRESET_MAP[environment ?? 'studio'];
  const lighting = LIGHTING_PRESETS[lightingPreset];

  return (
    <>
      <Environment preset={environment} environmentIntensity={0.5} />
      <ambientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />
      <directionalLight
        position={lighting.directionalPosition}
        intensity={lighting.directionalIntensity}
        color={lighting.directionalColor}
        castShadow
        shadow-mapSize-width={tier.shadowMapSize}
        shadow-mapSize-height={tier.shadowMapSize}
      />
    </>
  );
}

function CameraRig({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));
  const currentPos = useRef(new THREE.Vector3(0, 0, 8));

  useFrame(() => {
    const yOffset = Math.sin(scrollProgress * Math.PI) * 0.5;
    targetPos.current.set(0, yOffset, 8);
    currentPos.current.lerp(targetPos.current, 0.08);
    camera.position.copy(currentPos.current);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function StoryContent({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { reducedMotion } = useMotionPolicy();

  if (reducedMotion) {
    return (
      <Html center className="text-center">
        <div style={{ color: COLOR_TOKENS.FOREGROUND }}>
          <h2 className="text-2xl font-bold mb-2">{title || '3D Storytelling'}</h2>
          <p className="text-slate-400">{subtitle}</p>
        </div>
      </Html>
    );
  }

  return (
    <Html center className="text-center">
      <div style={{ color: COLOR_TOKENS.FOREGROUND }}>
        <h2 className="text-2xl font-bold mb-2">{title || '3D Storytelling'}</h2>
        {subtitle && <p className="text-slate-400">{subtitle}</p>}
      </div>
    </Html>
  );
}

function StaticFallback({ title, subtitle, background }: { title?: string; subtitle?: string; background?: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: background || COLOR_TOKENS.VOID }}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-1 w-16" style={{ backgroundColor: GOLD }} />
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400/40">
          {title || '3D Experience'}
        </h3>
        {subtitle && <p className="text-xs mt-2 text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function CinematicStoryteller({
  title,
  subtitle,
  background = COLOR_TOKENS.VOID,
  environment = 'studio',
  className,
}: CinematicStorytellerProps) {
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
        <StaticFallback title={title} subtitle={subtitle} background={background} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
      {contextLost && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: background }}
        >
          <p className="text-slate-400 text-xs">3D experience paused</p>
        </div>
      )}
      <Canvas
        dpr={[1, tier.maxDpr]}
        frameloop="always"
        onCreated={handleCreated}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ background }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
          <CinematicLighting environment={environment} />
          <CameraRig />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.3}
            scale={10}
            blur={3}
            far={15}
          />
          <StoryContent title={title} subtitle={subtitle} />
        </Suspense>
      </Canvas>
    </div>
  );
}

CinematicStoryteller.displayName = 'CinematicStoryteller';

export { CinematicStoryteller };