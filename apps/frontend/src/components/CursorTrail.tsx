'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface TrailEntry {
  x: number;
  y: number;
  life: number;
  opacity: number;
  scale: number;
  imageIndex: number;
}

interface CursorTrailProps {
  /** Array of image URLs to cycle through in the trail */
  images: string[];
  /** Maximum number of trail items before oldest are removed */
  maxTrailLength?: number;
  /** Enable/disable the trail */
  enabled?: boolean;
  /** Size of each trail image in pixels */
  size?: number;
  /** Delay between spawning trail items (ms) */
  spawnInterval?: number;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_TRAIL_LENGTH = 24;
const DEFAULT_SIZE = 48;
const DEFAULT_SPAWN_INTERVAL = 40;
const LIFETIME_DECAY = 0.025;
const SCALE_DECAY = 0.985;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CursorTrail({
  images,
  maxTrailLength = DEFAULT_TRAIL_LENGTH,
  enabled = true,
  size = DEFAULT_SIZE,
  spawnInterval = DEFAULT_SPAWN_INTERVAL,
}: CursorTrailProps) {
  const [mounted, setMounted] = useState(false);
  const { animationsEnabled, finePointer } = useMotionPolicy();

  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<TrailEntry[]>([]);
  const poolRef = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const imageIndexRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Get or create a DOM element from the pool */
  const getPoolElement = useCallback(
    (index: number): HTMLDivElement | null => {
      const container = containerRef.current;
      if (!container) return null;

      // Extend pool if needed
      while (poolRef.current.length <= index) {
        const el = document.createElement('div');
        el.className = 'absolute top-0 left-0 will-change-transform';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.opacity = '0';
        el.style.transform = 'translate3d(-100px, -100px, 0) scale(1)';
        el.style.borderRadius = '50%';
        el.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.draggable = false;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.boxShadow = '0 2px 12px rgba(212, 175, 55, 0.25)';
        img.style.border = '1px solid rgba(212, 175, 55, 0.15)';
        img.style.borderRadius = '50%';
        el.appendChild(img);

        container.appendChild(el);
        poolRef.current.push(el);
      }

      return poolRef.current[index] ?? null;
    },
    [size],
  );

  const spawnEntry = useCallback(
    (x: number, y: number) => {
      const now = performance.now();
      if (now - lastSpawnRef.current < spawnInterval) return;
      lastSpawnRef.current = now;

      const entry: TrailEntry = {
        x,
        y,
        life: 1,
        opacity: 0.85,
        scale: 1,
        imageIndex: imageIndexRef.current % Math.max(images.length, 1),
      };
      imageIndexRef.current++;

      trailRef.current.push(entry);

      // Trim oldest
      while (trailRef.current.length > maxTrailLength) {
        trailRef.current.shift();
      }
    },
    [images.length, maxTrailLength, spawnInterval],
  );

  const animate = useCallback(() => {
    // Update each pool element to match its trail entry
    for (let i = 0; i < trailRef.current.length; i++) {
      const entry = trailRef.current[i];
      entry.life -= LIFETIME_DECAY;
      entry.scale *= SCALE_DECAY;

      if (entry.life <= 0) continue;

      const el = getPoolElement(i);
      if (el) {
        const img = el.querySelector('img');
        if (img && img.src !== images[entry.imageIndex]) {
          img.src = images[entry.imageIndex];
        }

        const opacity = entry.opacity * Math.max(entry.life, 0);
        const scale = entry.scale * (0.3 + 0.7 * entry.life);
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(${entry.x - size / 2}px, ${entry.y - size / 2}px, 0) scale(${scale})`;
      }
    }

    // Remove dead entries (backwards)
    for (let i = trailRef.current.length - 1; i >= 0; i--) {
      if (trailRef.current[i].life <= 0) {
        trailRef.current.splice(i, 1);
      }
    }

    // Hide unused pool elements
    for (let i = trailRef.current.length; i < poolRef.current.length; i++) {
      poolRef.current[i].style.opacity = '0';
      poolRef.current[i].style.transform = 'translate3d(-100px, -100px, 0) scale(1)';
    }

    if (trailRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      rafRef.current = 0;
    }
  }, [getPoolElement, images, size]);

  useEffect(() => {
    if (!mounted || !enabled || !animationsEnabled || !finePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      spawnEntry(e.clientX, e.clientY);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;

      // Clean up pool DOM elements
      for (const el of poolRef.current) {
        el.remove();
      }
      poolRef.current = [];
      trailRef.current = [];
    };
  }, [mounted, enabled, animationsEnabled, finePointer, spawnEntry, animate]);

  // Don't render until client-side mount or if conditions aren't met
  if (!mounted || !enabled || !animationsEnabled || !finePointer) return null;

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    />
  );
}
