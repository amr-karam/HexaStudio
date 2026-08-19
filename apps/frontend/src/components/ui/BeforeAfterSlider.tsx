'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: 'auto' | '1/1' | '4/3' | '16/9' | '3/2';
  initialPosition?: number;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
  aspectRatio = '16/9',
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(initialPosition);
  const [isDragging, setIsDragging] = React.useState(false);

  const updatePositionFromClientX = React.useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    e.preventDefault();
    setIsDragging(true);
    updatePositionFromClientX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (reduceMotion) return;
    setIsDragging(true);
    if (e.touches[0]) {
      updatePositionFromClientX(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (reduceMotion) return;
    let nextPos = position;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextPos = Math.max(0, position - (e.shiftKey ? 10 : 2));
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextPos = Math.min(100, position + (e.shiftKey ? 10 : 2));
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextPos = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextPos = 100;
      e.preventDefault();
    } else if (e.key === 'PageDown') {
      nextPos = Math.max(0, position - 20);
      e.preventDefault();
    } else if (e.key === 'PageUp') {
      nextPos = Math.min(100, position + 20);
      e.preventDefault();
    }
    setPosition(nextPos);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePositionFromClientX(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePositionFromClientX(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, updatePositionFromClientX]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full overflow-hidden select-none rounded-2xl border border-white/10 bg-void shadow-2xl',
        aspectRatio !== 'auto' && `aspect-[${aspectRatio}]`,
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After image (full width background layer) */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
        <div className="absolute bottom-5 left-5 z-10 px-3.5 py-1.5 rounded-full bg-void/80 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground font-light">
            {afterLabel}
          </span>
        </div>
      </div>

      {/* Before image (clipped by percentage) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
        aria-hidden="true"
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
        />
        <div className="absolute bottom-5 right-5 z-10 px-3.5 py-1.5 rounded-full bg-void/80 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary font-light">
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* Divider line & interactive handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-light via-white to-accent shadow-[0_0_12px_rgba(212,175,55,0.6)] cursor-ew-resize transition-opacity"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label="Comparison slider position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          onKeyDown={handleKeyDown}
          className={cn(
            'absolute -translate-x-1/2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full',
            'bg-obsidian/90 backdrop-blur-xl border border-accent/60 shadow-[0_0_20px_rgba(212,175,55,0.35)]',
            'flex items-center justify-center cursor-ew-resize',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void',
            'transition-transform duration-200 ease-out',
            isDragging ? 'scale-115 border-accent shadow-[0_0_30px_rgba(212,175,55,0.6)]' : 'hover:scale-105'
          )}
        >
          {/* Subtle gold center diamond */}
          <div className="w-1.5 h-1.5 rotate-45 bg-accent shadow-[0_0_6px_rgba(212,175,55,0.8)]" aria-hidden="true" />

          {/* Left/Right chevron glyphs */}
          <svg
            className="absolute inset-0 w-full h-full p-2.5 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-4 4 4 4M16 7l4 4-4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

