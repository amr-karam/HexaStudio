'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import ShaderGradient from './ShaderGradient';
import ParticleDust from './ParticleDust';

interface Props {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  particleCount?: number;
  className?: string;
}

export default function AmbientScene({
  color1,
  color2,
  color3,
  speed = 0.12,
  particleCount = 150,
  className,
}: Props) {
  return (
    <div className={`fixed inset-0 -z-10 pointer-events-none ${className ?? ''}`} aria-hidden="true">
      <Canvas
        gl={{ antialias: false, alpha: false }}
        camera={{ position: [0, 0, 1], fov: 45 }}
        dpr={[1, 2]}
        style={{ background: (color1 as string) || '#050508' }}
      >
        <Suspense fallback={null}>
          <ShaderGradient
            color1={color1}
            color2={color2}
            color3={color3}
            speed={speed}
            intensity={0.6}
          />
          <ParticleDust count={particleCount} spread={6} size={0.015} opacity={0.1} />
        </Suspense>
      </Canvas>
    </div>
  );
}
