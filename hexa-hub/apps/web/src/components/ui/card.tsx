'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'glass';
  hover?: 'none' | 'glow' | 'lift';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-[#141414] border border-[#1F1F1F]',
  elevated: 'bg-[#1A1A1A] border border-[#1F1F1F] shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
  glass: 'bg-[#141414]/60 backdrop-blur-xl border border-[#1F1F1F]/50',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  hover = 'glow',
  padding = 'md',
  children,
  className,
  onClick,
}: CardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={onClick ? { scale: 1.01 } : hover === 'lift' ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-2xl relative overflow-hidden transition-all duration-500',
        variantClasses[variant],
        paddingClasses[padding],
        onClick && 'cursor-pointer',
        hover === 'glow' && 'hover:border-[#D4A843]/20',
        className,
      )}
    >
      {hover === 'glow' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-b from-[#D4A843]/[0.02] to-transparent" />
      )}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
