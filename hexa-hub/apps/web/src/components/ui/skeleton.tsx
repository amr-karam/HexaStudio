'use client';

import React from 'react';
import { cn } from './cn';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[#1F1F1F]/60';

  const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'circular' && !width) {
    style.width = '40px';
    style.height = '40px';
  }

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}
