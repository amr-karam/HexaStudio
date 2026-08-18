'use client';

import React from 'react';
import Image from 'next/image';
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/cn';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | null;
  statusColor?: string;
  className?: string;
}

const avatarSizes = cva('relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden', {
  variants: {
    size: {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

const imageDimensions: Record<NonNullable<AvatarProps['size']>, { width: number; height: number }> = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

const statusDotSizes: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-2 w-2 ring-1',
  sm: 'h-2.5 w-2.5 ring-1',
  md: 'h-3 w-3 ring-1',
  lg: 'h-3.5 w-3.5 ring-[1.5px]',
  xl: 'h-4 w-4 ring-2',
};

const statusColors: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'bg-success',
  offline: 'bg-text-tertiary',
  away: 'bg-warning',
  busy: 'bg-error',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  status = null,
  statusColor,
  className,
}: AvatarProps) {
  const initials = React.useMemo(
    () => (fallback ? getInitials(fallback) : alt ? getInitials(alt) : '?'),
    [fallback, alt],
  );
  const [imageError, setImageError] = React.useState(false);
  const dims = imageDimensions[size];

  return (
    <span className={cn(avatarSizes({ size }), className)}>
      {src && !imageError ? (
        <span className="relative block h-full w-full">
          <Image
            src={src}
            alt={alt}
            width={dims.width}
            height={dims.height}
            onError={() => setImageError(true)}
            className="h-full w-full rounded-full object-cover border-2 border-surface"
            unoptimized={!src.startsWith('/')}
          />
        </span>
      ) : (
        <span
          className={cn(
            'h-full w-full rounded-full flex items-center justify-center font-light tracking-wide',
            'bg-surface-elevated text-text-tertiary border-2 border-surface',
          )}
          aria-label={alt || fallback || 'Avatar'}
        >
          {initials}
        </span>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-[var(--color-void-deep)]',
            statusDotSizes[size],
            statusColor ?? statusColors[status],
          )}
          aria-label={status}
        />
      )}
    </span>
  );
}
