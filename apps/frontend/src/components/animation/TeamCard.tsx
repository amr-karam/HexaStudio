'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TeamCardProps {
  children: ReactNode;
  className?: string;
  overlayContent?: ReactNode;
  overlayClassName?: string;
}

export function TeamCard({
  children,
  className,
  overlayContent,
  overlayClassName,
}: TeamCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-sl-gold-subtle/15 bg-sl-obsidian',
        className,
      )}
    >
      {children}

      {overlayContent && (
        <div
          className={cn(
            'absolute bottom-3 start-3 end-3',
            'translate-y-2 opacity-0 transition-all duration-500',
            'ease-[var(--hexa-ease-transition)]',
            'group-hover:translate-y-0 group-hover:opacity-100',
            overlayClassName,
          )}
          style={{
            background: 'rgba(20,10,6,0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
          }}
        >
          {overlayContent}
        </div>
      )}
    </div>
  );
}
