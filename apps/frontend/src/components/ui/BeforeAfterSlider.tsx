'use client';

import * as React from 'react';
import Image from 'next/image';
import { useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: 'auto' | '1/1' | '4/3' | '16/9' | '3/2';
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
  aspectRatio = '16/9',
}: BeforeAfterSliderProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dividerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const positionX = useMotionValue(50);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    e.preventDefault();
    setIsDragging(true);
    updatePositionFromEvent(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (reduceMotion) return;
    setIsDragging(true);
    if (e.touches[0]) {
      updatePositionFromEvent(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging || reduceMotion) return;
    updatePositionFromEvent(e.clientX);
  };

  const handleTouchMove = (e: globalThis.TouchEvent) => {
    if (!isDragging || reduceMotion || !e.touches[0]) return;
    updatePositionFromEvent(e.touches[0].clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromEvent = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    positionX.set(percent);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, reduceMotion]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden cursor-ew-resize select-none',
        aspectRatio !== 'auto' && `aspect-[${aspectRatio}]`,
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="group"
      aria-label={`Before and after comparison. Drag the slider to compare.`}
    >
      {/* After image (full width, clipped) */}
      <div
        className="absolute inset-0"
        aria-hidden={isDragging}
      >
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs uppercase tracking-wider px-2 py-1 rounded">
          {afterLabel}
        </div>
      </div>

      {/* Before image (clipped by clip-path) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - positionX.get()}% 0 0)`,
        }}
        aria-hidden={!isDragging}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs uppercase tracking-wider px-2 py-1 rounded">
          {beforeLabel}
        </div>
      </div>

      {/* Divider line */}
      <div
        ref={dividerRef}
        className="absolute top-0 bottom-0 w-px bg-white/80 shadow-lg"
        style={{
          left: '50%',
        }}
      >
        {/* Handle */}
        <div
          className={cn(
            'absolute -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform duration-150',
            isDragging && 'scale-110'
          )}
        >
          <svg
            className="w-5 h-5 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-4 4 4 4M16 7l4 4-4 4" />
          </svg>
        </div>
      </div>

      {/* Handle indicator */}
      {!reduceMotion && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            className="w-8 h-8 text-white drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-4 4 4 4M16 7l4 4-4 4" />
          </svg>
        </div>
      )}
    </div>
  );
}
