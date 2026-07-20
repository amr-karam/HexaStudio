'use client';

import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

const variants = {
  primary:
    'bg-accent text-background hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]',
  secondary:
    'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20',
  ghost: 'bg-transparent text-white hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  outline:
    'border border-border text-foreground hover:border-accent hover:text-accent hover:bg-accent/5',
  luxury:
    'bg-white/[0.03] text-white border border-accent/40 backdrop-blur-xl hover:border-accent hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

/**
 * The light sweep that travels across the button on hover.
 * Clipped to the button bounds via an inner overflow-hidden span so the
 * button itself does not need `overflow-hidden` (preserving focus ring offsets).
 */
const Shimmer = () => (
  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
    <span className="absolute top-0 -left-full h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-transform duration-1000 ease-out group-hover:translate-x-[400%] group-hover:opacity-100" />
  </span>
);

/**
 * Thin gold ring spinner that matches the luxury aesthetic.
 */
const LoadingSpinner = () => (
  <span
    aria-hidden
    className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border border-accent/30 border-t-accent"
  />
);

// `motion.button`'s prop type overrides several DOM event handlers with
// incompatible signatures (onAnimationStart, onDrag, etc.). We cast it to a
// component that accepts standard `ButtonHTMLAttributes` plus the three motion
// props we use, so the public `ButtonProps` interface stays unchanged and the
// strict TS compiler stays happy.
type MotionButtonComponent = React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    { whileHover?: TargetAndTransition; whileTap?: TargetAndTransition; transition?: Transition } &
    React.RefAttributes<HTMLButtonElement>
>;

const MotionButton = motion.button as unknown as MotionButtonComponent;

// Radix `Slot` forwards all props to its single child at runtime, but its
// TypeScript signature only declares `HTMLAttributes` (no `disabled` etc.).
// We widen it to accept full button attributes so `disabled` and other button
// props typecheck while still being forwarded to the slotted child.
const SlotButton = Slot as unknown as React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading = false, asChild = false, disabled, children, ...props },
    ref
  ) => {
    const base = cn(
      'group relative inline-flex items-center justify-center rounded-full font-medium',
      'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:opacity-50 disabled:pointer-events-none active:scale-95',
      variants[variant],
      sizes[size],
      className
    );

    const showShimmer = variant === 'primary' || variant === 'luxury';

    if (asChild) {
      return (
        <SlotButton ref={ref} className={base} disabled={isLoading || disabled} {...props}>
          {showShimmer ? <Shimmer /> : null}
          {isLoading ? <LoadingSpinner /> : null}
          <Slottable>{children}</Slottable>
        </SlotButton>
      );
    }

    return (
      <MotionButton
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={base}
        disabled={isLoading || disabled}
        {...props}
      >
        {showShimmer ? <Shimmer /> : null}
        {isLoading ? <LoadingSpinner /> : null}
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };
