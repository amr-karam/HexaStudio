'use client';

import { Suspense, useRef, useCallback, useState } from 'react';
import { Canvas, useFrame, type RootState, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows, Html } from '@react-three/drei';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import * as THREE from 'three';

type EnvironmentPreset = 'sunset' | 'dawn' | 'night' | 'studio' | 'warehouse' | 'city' | 'apartment' | 'forest' | 'lobby' | 'park';

interface CinematicStorytellerProps {
  title?: string;
  subtitle?: string;
  background?: string;
  environment?: EnvironmentPreset;
  className?: string;
}

function CinematicLighting({ environment = 'studio' }: { environment?: EnvironmentPreset }) {
  const { tier } = useQualityTier();

  return (
    <>
      <Environment preset={environment} environmentIntensity={0.5} />
      <ambientLight intensity={0.4} color="#eaf1ff" />
      <directionalLight
        position={[8, 12, 4]}
        intensity={1.5}
        color="#ffffff"
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
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}
    >
      <div style={{ width: '2rem', height: '0.25rem', backgroundColor: GOLD }} />
      <h3 style={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.2em', color: '#6b7280' }}>
        {title || '3D Experience'}
      </h3>
      {subtitle && <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{subtitle}</p>}
    </div>
  );
}

export function CinematicStoryteller({
  title,
  subtitle,
  background = COLOR_TOKENS.VOID,
  environment = 'studios',
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
          style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: background ?? COLOR_TOKENS.VOID }}
        >
          <p style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>3D experience paused</p>
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
        style={{ background: background }}
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