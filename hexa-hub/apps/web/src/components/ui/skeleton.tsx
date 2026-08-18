'use client';

import React from 'react';
import { cn } from '@/components/ui/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'rounded-md',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-border animate-pulse shimmer relative overflow-hidden',
        variantClasses[variant],
        className,
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
