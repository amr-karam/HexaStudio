'use client';

import React from 'react';
import { cn } from '@/components/ui/cn';

// ─── Base shimmer skeleton ────────────────────────────────────────────────────

function Shimmer({ className, style, ...rest }: { className?: string; style?: React.CSSProperties } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn('animate-pulse bg-[#1F1F1F]/60', className)}
      style={style}
      {...rest}
    />
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'p-6 bg-[#141414] border border-[#1F1F1F] rounded-2xl space-y-4',
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-2/5 rounded-md" />
          <Shimmer className="h-3 w-3/5 rounded-md" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2.5 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Shimmer
            key={i}
            className="h-3 rounded-md"
            style={{ width: `${85 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SkeletonTable ────────────────────────────────────────────────────────────

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function SkeletonTable({
  className,
  rows = 5,
  columns = 4,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[#1F1F1F]">
        {Array.from({ length: columns }).map((_, i) => (
          <Shimmer
            key={i}
            className="h-4 rounded-md"
            style={{ width: `${100 / columns}%`, minWidth: '60px' }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-6 py-4 border-b border-[#1F1F1F]/50 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Shimmer
              key={colIdx}
              className="h-3.5 rounded-md"
              style={{
                width: colIdx === 0 ? '30%' : `${60 + Math.random() * 20}%`,
                minWidth: '40px',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SkeletonText ─────────────────────────────────────────────────────────────

interface SkeletonTextProps {
  className?: string;
  width?: string;
}

export function SkeletonText({ className, width = '100%' }: SkeletonTextProps) {
  return (
    <Shimmer
      className={cn('h-4 rounded-md', className)}
      style={{ width }}
    />
  );
}

// ─── SkeletonAvatar ───────────────────────────────────────────────────────────

interface SkeletonAvatarProps {
  className?: string;
  size?: number;
}

export function SkeletonAvatar({ className, size = 40 }: SkeletonAvatarProps) {
  return (
    <Shimmer
      className={cn('rounded-full shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}

// ─── SkeletonPageHeader ───────────────────────────────────────────────────────

interface SkeletonPageHeaderProps {
  className?: string;
}

export function SkeletonPageHeader({ className }: SkeletonPageHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Shimmer className="h-3 w-32 rounded-md" />
      <Shimmer className="h-9 w-64 rounded-lg" />
      <Shimmer className="h-4 w-96 rounded-md" />
    </div>
  );
}

// ─── SkeletonGrid ─────────────────────────────────────────────────────────────

interface SkeletonGridProps {
  className?: string;
  count?: number;
  columns?: number;
}

export function SkeletonGrid({
  className,
  count = 3,
  columns = 3,
}: SkeletonGridProps) {
  return (
    <div
      className={cn('grid gap-5', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
