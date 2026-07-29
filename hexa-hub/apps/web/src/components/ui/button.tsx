'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';
import { Spinner } from './spinner';

// Omit HTML event attributes that conflict with Framer Motion's custom event types
// (onAnimationStart, onDrag, onPan, onTap, onHover — all have different signatures)
type MotionSafeHTMLAttributes = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onAnimationStart'
  | 'onDrag' | 'onDragEnd' | 'onDragStart'
  | 'onPan' | 'onPanEnd' | 'onPanStart'
  | 'onTap' | 'onTapCancel' | 'onTapStart'
  | 'onHoverEnd' | 'onHoverStart'
>;

export interface ButtonProps extends MotionSafeHTMLAttributes {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#D4A843] text-[#0A0A0A] hover:bg-[#D4A843]/90 hover:shadow-[0_0_20px_rgba(212,168,67,0.15)]',
  secondary:
    'bg-transparent text-white border border-[#1F1F1F] hover:border-[#D4A843]/30 hover:bg-white/[0.03]',
  ghost:
    'bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.05]',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-light tracking-wide transition-all duration-300',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="border-t-[#0A0A0A] border-[#0A0A0A]/20" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
}
