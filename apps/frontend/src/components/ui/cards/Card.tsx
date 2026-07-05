import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid';
}

export const Card = ({ children, className, variant = 'glass' }: CardProps) => {
  const variants = {
    glass: 'bg-[var(--glass-bg)] backdrop-blur-[12px] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)]',
    solid: 'bg-surface border border-border hover:bg-surface-light',
  };

  return (
    <div className={cn('p-6 transition-all duration-300', variants[variant], className)}>
      {children}
    </div>
  );
};
