'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { cn } from './cn';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | null;
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const statusDotClasses: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'bg-emerald-400',
  offline: 'bg-neutral-500',
  away: 'bg-amber-400',
  busy: 'bg-red-400',
};

const statusSizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-2.5 w-2.5 ring-1',
  md: 'h-3 w-3 ring-1',
  lg: 'h-3.5 w-3.5 ring-[1.5px]',
  xl: 'h-4 w-4 ring-2',
};

/** Pixel dimensions mapped to Tailwind size classes for next/image */
const imageDimensions: Record<NonNullable<AvatarProps['size']>, { width: number; height: number }> = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
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
  className,
}: AvatarProps) {
  const initials = useMemo(
    () => fallback ? getInitials(fallback) : alt ? getInitials(alt) : '?',
    [fallback, alt],
  );

  const [imageError, setImageError] = React.useState(false);
  const dims = imageDimensions[size];

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {src && !imageError ? (
        <span className={cn('relative block rounded-full overflow-hidden', sizeClasses[size])}>
          <Image
            src={src}
            alt={alt}
            width={dims.width}
            height={dims.height}
            onError={() => setImageError(true)}
            className="rounded-full object-cover border border-[#1F1F1F]"
            unoptimized={!src.startsWith('/')}
          />
        </span>
      ) : (
        <span
          className={cn(
            'rounded-full flex items-center justify-center font-light tracking-wide',
            'bg-[#1F1F1F] text-neutral-400 border border-[#1F1F1F]',
            sizeClasses[size],
          )}
          aria-label={alt || fallback || 'Avatar'}
        >
          {initials}
        </span>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-[#0A0A0A]',
            statusDotClasses[status],
            statusSizeClasses[size],
          )}
          aria-label={status}
        />
      )}
    </span>
  );
}
