'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { PremiumScene } from './PremiumShaders';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import { useSharedWebGLContext } from '@/hooks/useSharedWebGLContext';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Props {
  /** Primary gradient color (center) */
  color1?: string;
  /** Secondary gradient color (mid) */
  color2?: string;
  /** Tertiary gradient color (edges) */
  color3?: string;
  /** Gold accent color */
  goldColor?: string;
  /** Animation speed multiplier */
  speed?: number;
  /** Particle count */
  particleCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** When false, don't render the WebGL canvas at all. */
  enabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Static CSS gradient fallback (reduced motion)                              */
/* -------------------------------------------------------------------------- */

function StaticGradient({ color1, color2, color3 }: Pick<Props, 'color1' | 'color2' | 'color3'>) {
  const c1 = color1 || '#0A0A0B';
  const c2 = color2 || '#0F0F10';
  const c3 = color3 || '#0a1128';

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
  goldColor,
  speed = 0.12,
  particleCount = 300,
  className,
  enabled = true,
}: Props) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // WebGL context-loss recovery: pause the render loop on loss, resume on
  // restore — never unmounts the Canvas (closes the getProgramParameter race).
  const { registerContext } = useContextLossRecovery();
  const cleanupContextRef = useRef<(() => void) | null>(null);

  // Use shared WebGL context from provider when available
  const sharedGl = useSharedWebGLContext();

  useEffect(() => {
    return () => {
      cleanupContextRef.current?.();
      cleanupContextRef.current = null;
    };
  }, []);

  // Defer canvas mount until main-thread idle (avoids blocking initial FCP/TBT)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => setMounted(true));
      return () => (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setMounted(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

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
  }, [enabled, mounted]);

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
          gl={sharedGl ?? { antialias: false, alpha: false }}
          camera={{ position: [0, 0, 1], fov: 45 }}
          dpr={[1, 1.25]}
          style={{ background: color1 || '#0A0A0B' }}
          onCreated={(state) => {
            cleanupContextRef.current = registerContext(state);
          }}
        >
          <Suspense fallback={null}>
            <PremiumScene
              gradient={{
                color1: color1 || '#0F0F10',
                color2: color2 || '#0a1128',
                color3: color3 || '#0A0A0B',
                goldColor: goldColor || '#D4AF37',
                speed,
                intensity: 0.6,
                goldIntensity: 0.8,
              }}
              glass={{
                baseColor: 'rgba(22, 22, 24, 0.6)',
                opacity: 0.9,
                borderOpacity: 0.4,
                highlightColor: goldColor || '#D4AF37',
                highlightIntensity: 0.7,
              }}
              particles={{
                count: particleCount,
                spread: 10,
                size: 0.01,
                color: goldColor || '#D4AF37',
                opacity: 0.1,
                speed: 0.06,
              }}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}