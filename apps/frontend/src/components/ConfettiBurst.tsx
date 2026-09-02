'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ConfettiBurstProps {
  /** Trigger the confetti burst */
  active: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Number of particles */
  particleCount?: number;
  /** Burst origin X (0-1, relative to viewport) */
  originX?: number;
  /** Burst origin Y (0-1, relative to viewport) */
  originY?: number;
  /** CSS class for the container */
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  gravity: number;
  life: number;
  decay: number;
  shape: 'rect' | 'circle';
}

/* -------------------------------------------------------------------------- */
/*  Design System Colors (Gold Palette)                                        */
/* -------------------------------------------------------------------------- */

const CONFETTI_COLORS = [
  '#D4AF37', // gold
  '#E5C76B', // gold-bright
  '#A8862E', // gold-deep
  '#FFD700', // bright gold
  '#C9B037', // old gold
  '#B8860B', // dark goldenrod
  '#DAA520', // goldenrod
  '#F0E68C', // khaki
  '#FFFFFF', // white accent
  '#FFD700', // pure gold
];

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const BURST_FORCE = 18;
const GRAVITY = 0.35;
const FRICTION = 0.99;
const ROTATION_SPEED_RANGE = 12;
const LIFE_DECAY = 0.015;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomColor(): string {
  return CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ConfettiBurst({
  active,
  onComplete,
  particleCount = 80,
  originX = 0.5,
  originY = 0.6,
  className,
}: ConfettiBurstProps) {
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const hasFiredRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Create a burst of particles */
  const createBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const originPxX = canvas.width * originX;
    const originPxY = canvas.height * originY;

    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const force = randomRange(4, BURST_FORCE);
      const isCircle = Math.random() > 0.6;

      particles.push({
        x: originPxX,
        y: originPxY,
        vx: Math.cos(angle) * force * randomRange(0.5, 1.5),
        vy: Math.sin(angle) * force * randomRange(0.5, 1.5) - randomRange(2, 8),
        rotation: randomRange(0, 360),
        rotationSpeed: randomRange(-ROTATION_SPEED_RANGE, ROTATION_SPEED_RANGE),
        width: isCircle ? randomRange(4, 8) : randomRange(6, 12),
        height: isCircle ? randomRange(4, 8) : randomRange(3, 6),
        color: randomColor(),
        opacity: 1,
        gravity: GRAVITY,
        life: 1,
        decay: LIFE_DECAY,
        shape: isCircle ? 'circle' : 'rect',
      });
    }

    particlesRef.current = particles;
  }, [particleCount, originX, originY]);

  /** Render one frame */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Physics
      p.vy += p.gravity;
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.opacity = Math.max(p.life, 0);

      // Remove dead particles
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Draw
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      rafRef.current = requestAnimationFrame(renderFrame);
    } else {
      rafRef.current = 0;
      onComplete?.();
    }
  }, [onComplete]);

  /** Watch for active trigger */
  useEffect(() => {
    if (!mounted || reducedMotion) {
      if (active && mounted && reducedMotion) {
        // Skip animation, fire callback immediately
        onComplete?.();
      }
      return;
    }

    if (active && !hasFiredRef.current) {
      hasFiredRef.current = true;

      // Resize canvas to viewport
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      createBurst();
      rafRef.current = requestAnimationFrame(renderFrame);
    }

    if (!active) {
      hasFiredRef.current = false;
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [active, mounted, reducedMotion, createBurst, renderFrame, onComplete]);

  // Don't render on server or when reduced motion is active
  if (!mounted || reducedMotion) return null;

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 pointer-events-none z-[9999]',
        className,
      )}
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    />
  );
}


