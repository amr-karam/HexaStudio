'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ImageCarousel3DProps {
  /** Array of image URLs to display in the ring */
  images: string[];
  /** Radius of the carousel ring in pixels */
  radius?: number;
  /** Auto-rotate when idle */
  autoRotate?: boolean;
  /** Auto-rotate speed (degrees per second) */
  autoRotateSpeed?: number;
  /** CSS class for the container */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_RADIUS = 320;
const FRICTION = 0.96;
const SCROLL_SENSITIVITY = 0.0005;
const DRAG_SENSITIVITY = 0.3;
const MIN_VELOCITY = 0.001;
const AUTO_ROTATE_SPEED = 12;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ImageCarousel3D({
  images,
  radius = DEFAULT_RADIUS,
  autoRotate = true,
  autoRotateSpeed = AUTO_ROTATE_SPEED,
  className,
}: ImageCarousel3DProps) {
  const [mounted, setMounted] = useState(false);
  const { animationsEnabled } = useMotionPolicy();

  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const activeIndexRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Calculate the angle per item based on image count */
  const anglePerItem = (2 * Math.PI) / Math.max(images.length, 1);

  /** Update the ring's 3D transform */
  const updateTransform = useCallback(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const rotationDeg = (rotationRef.current * 180) / Math.PI;
    ring.style.transform = `translateZ(${-radius}px) rotateY(${rotationDeg}deg)`;

    // Determine active index (which card faces the viewer)
    const normalizedAngle = ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const idx = Math.round(normalizedAngle / anglePerItem) % images.length;
    if (idx !== activeIndexRef.current) {
      activeIndexRef.current = idx;
    }
  }, [radius, anglePerItem, images.length]);

  /** Animation loop with inertia */
  const tick = useCallback(() => {
    if (!isDraggingRef.current) {
      // Apply auto-rotate when velocity is negligible
      if (Math.abs(velocityRef.current) < MIN_VELOCITY && autoRotate && animationsEnabled) {
        velocityRef.current = (autoRotateSpeed * Math.PI) / 180 / 60; // degrees→radians per frame at 60fps
      }

      velocityRef.current *= FRICTION;
      rotationRef.current += velocityRef.current;
    }

    updateTransform();

    if (Math.abs(velocityRef.current) > MIN_VELOCITY || isDraggingRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
      // Final transform update
      updateTransform();
    }
  }, [autoRotate, autoRotateSpeed, animationsEnabled, updateTransform]);

  const startLoop = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  /* ── Pointer (mouse / touch) drag ───────────────────────────────────────── */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      if (!animationsEnabled) return;
      isDraggingRef.current = true;
      velocityRef.current = 0;

      const point = 'touches' in e ? e.touches[0] : e;
      lastPointerRef.current = { x: point.clientX, y: point.clientY };

      // Capture pointer for reliable drag
      if ('pointerId' in e) {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }

      startLoop();
    },
    [animationsEnabled, startLoop],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      if (!isDraggingRef.current) return;

      const point = 'touches' in e ? e.touches[0] : e;
      const dx = point.clientX - lastPointerRef.current.x;
      lastPointerRef.current = { x: point.clientX, y: point.clientY };

      velocityRef.current = dx * DRAG_SENSITIVITY;
      rotationRef.current += velocityRef.current;
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    startLoop();
  }, [startLoop]);

  /* ── Scroll wheel ───────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!mounted || !animationsEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * SCROLL_SENSITIVITY;
      startLoop();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [mounted, animationsEnabled, startLoop]);

  /* ── Keyboard navigation ────────────────────────────────────────────────── */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!animationsEnabled) return;

      const step = anglePerItem;
      if (e.key === 'ArrowLeft') {
        velocityRef.current = -step * 0.15;
        startLoop();
      } else if (e.key === 'ArrowRight') {
        velocityRef.current = step * 0.15;
        startLoop();
      }
    },
    [animationsEnabled, anglePerItem, startLoop],
  );

  /* ── Lifecycle ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!mounted || !animationsEnabled) return;

    startLoop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [mounted, animationsEnabled, startLoop]);

  /* ── Static grid fallback for reduced motion ────────────────────────────── */

  if (!mounted || !animationsEnabled) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto px-4',
          className,
        )}
        role="region"
        aria-label="Image carousel (static)"
      >
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative aspect-[3/4] overflow-hidden rounded-xl border border-sl-gold-subtle/15 bg-sl-obsidian"
          >
            <Image
              src={src}
              alt={`Carousel image ${idx + 1} of ${images.length}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full flex items-center justify-center py-12 select-none overflow-hidden',
        className,
      )}
      style={{ perspective: '1200px' }}
      role="region"
      aria-label={`3D image carousel. Showing image ${activeIndexRef.current + 1} of ${images.length}. Use arrow keys or drag to navigate.`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      aria-roledescription="carousel"
    >
      {/* Ring container */}
      <div
        ref={ringRef}
        className="relative"
        style={{
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {images.map((src, idx) => {
          const angle = idx * anglePerItem;
          const angleDeg = (angle * 180) / Math.PI;

          return (
            <div
              key={idx}
              className="absolute"
              style={{
                width: 200,
                height: 260,
                left: -100,
                top: -130,
                transform: `rotateY(${angleDeg}deg) translateZ(${radius}px)`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${idx + 1} of ${images.length}`}
            >
              <div className="relative w-full h-full overflow-hidden rounded-2xl border border-sl-gold-subtle/20 bg-sl-obsidian shadow-lg shadow-black/30">
                <Image
                  src={src}
                  alt={`Carousel image ${idx + 1} of ${images.length}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  sizes="200px"
                  draggable={false}
                />
                {/* Subtle gold reflection */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5 pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sl-alabaster/30 text-xs tracking-widest uppercase pointer-events-none">
        Drag or scroll to rotate
      </div>
    </div>
  );
}
