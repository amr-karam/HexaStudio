'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import ShaderGradient from './ShaderGradient';
import ParticleDust from './ParticleDust';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Props {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  particleCount?: number;
  className?: string;
  /** When false, don't render the WebGL canvas at all. */
  enabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Static CSS gradient fallback (reduced motion)                              */
/* -------------------------------------------------------------------------- */

function StaticGradient({ color1, color2, color3 }: Pick<Props, 'color1' | 'color2' | 'color3'>) {
  const c1 = color1 || '#0a0a1a';
  const c2 = color2 || '#0a1128';
  const c3 = color3 || '#050508';

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        background: `radial-gradient(ellipse at 50% 50%, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AmbientScene({
  color1,
  color2,
  color3,
  speed = 0.12,
  particleCount = 150,
  className,
  enabled = true,
}: Props) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render canvas after client-side mount (no SSR canvas)
  useEffect(() => { setMounted(true); }, []);

  // IntersectionObserver: pause when offscreen.
  useEffect(() => {
    if (!enabled || !mounted) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  // Pause on document hidden.
  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // When disabled, render nothing.
  if (!enabled) return null;

  // Under reduced motion: render a static CSS gradient instead of WebGL.
  if (reducedMotion) {
    return <StaticGradient color1={color1} color2={color2} color3={color3} />;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 pointer-events-none ${className ?? ''}`}
      aria-hidden="true"
    >
      {mounted && isVisible && (
        <Canvas
          gl={{ antialias: false, alpha: false }}
          camera={{ position: [0, 0, 1], fov: 45 }}
          dpr={[1, 1.25]}
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
            <ParticleDust
              count={particleCount}
              spread={6}
              size={0.015}
              opacity={0.1}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
