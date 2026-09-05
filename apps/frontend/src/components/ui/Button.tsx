'use client';

import * as React from 'react';
import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'luxury'
  | 'couture'
  | 'glass';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonColor = 'gold' | 'silver' | 'neutral';

export interface ButtonResponsiveSize {
  base?: ButtonSize;
  sm?: ButtonSize;
  md?: ButtonSize;
  lg?: ButtonSize;
  xl?: ButtonSize;
  '2xl'?: ButtonSize;
}

type AsProp = { as?: React.ElementType };

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    AsProp {
  variant?: ButtonVariant;
  size?: ButtonSize | ButtonResponsiveSize;
  color?: ButtonColor;
  isLoading?: boolean;
  isPressed?: boolean;
  asChild?: boolean;
  disabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Size Token Maps                                                         */
/* -------------------------------------------------------------------------- */

const SIZE_CLASSES: Record<NonNullable<ButtonSize>, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
  icon: 'h-9 w-9 p-0',
};

/* -------------------------------------------------------------------------- */
/*  Variant Styles                                                          */
/* -------------------------------------------------------------------------- */

const VARIANT_CLASSES: Record<NonNullable<ButtonVariant>, string> = {
  primary:
    'bg-sl-gold-subtle text-background hover:bg-sl-gold-subtle/90 shadow-lg shadow-sl-gold-subtle/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]',
  secondary:
    'bg-white/5 text-sl-alabaster border border-white/10 hover:bg-white/10 hover:border-white/20',
  ghost: 'bg-transparent text-sl-alabaster hover:bg-white/5',
  danger: 'bg-red-500 text-sl-alabaster hover:bg-red-600',
  outline:
    'border border-sl-silver/20 text-sl-alabaster hover:border-sl-gold-subtle hover:text-sl-gold-hover hover:bg-sl-gold-subtle/5',
  luxury:
    'bg-white/[0.03] text-sl-alabaster border border-sl-gold-subtle/40 backdrop-blur-2xl hover:border-sl-gold-subtle hover:shadow-[var(--artisan-glass-shadow),0_0_35px_rgba(212,175,55,0.25)]',
  couture:
    'bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-black text-sl-alabaster border border-sl-gold-subtle/40 shadow-[var(--artisan-glass-shadow),var(--artisan-glass-highlight)] hover:border-sl-gold-subtle hover:shadow-[var(--artisan-glass-shadow),0_0_40px_rgba(212,175,55,0.35)]',
  glass:
    'artisan-glass text-sl-alabaster hover:artisan-glass-gold hover:border-sl-gold-subtle/40 focus-visible:ring-sl-gold-subtle/60',
};

/* -------------------------------------------------------------------------- */
/*  Color Accent Helpers                                                    */
/* -------------------------------------------------------------------------- */

const COLOR_ACCENTS: Record<NonNullable<ButtonColor>, string> = {
  gold: 'focus-visible:ring-sl-gold-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  silver: 'focus-visible:ring-sl-silver/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  neutral: 'focus-visible:ring-sl-mist/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

/* -------------------------------------------------------------------------- */
/*  Sub-Components                                                          */
/* -------------------------------------------------------------------------- */

const Shimmer = () => (
  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
    <span className="absolute top-0 -left-full h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-transform duration-1000 ease-out group-hover:translate-x-[400%] group-hover:opacity-100" />
  </span>
);

const LoadingSpinner = () => (
  <span
    aria-hidden
    className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border border-sl-gold-subtle/30 border-t-accent"
  />
);

/* -------------------------------------------------------------------------- */
/*  Resolve responsive size                                                 */
/* -------------------------------------------------------------------------- */

function resolveSizeClasses(size: ButtonSize | ButtonResponsiveSize | undefined): string {
  if (!size) return SIZE_CLASSES.md;

  if (typeof size === 'string') {
    return SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  }

  const base = size.base ?? 'md';
  const baseClasses = SIZE_CLASSES[base] ?? SIZE_CLASSES.md;

  const responsiveMap: Record<string, string> = {};
  const breakpoints: Array<keyof ButtonResponsiveSize> = ['sm', 'md', 'lg', 'xl', '2xl'];

  for (const bp of breakpoints) {
    const bpSize = size[bp];
    if (bpSize && bpSize !== base) {
      responsiveMap[bp] = SIZE_CLASSES[bpSize] ?? SIZE_CLASSES.md;
    }
  }

  const parts = [baseClasses];
  for (const bp of breakpoints) {
    if (responsiveMap[bp]) {
      parts.push(`${bp}:${responsiveMap[bp]}`);
    }
  }

  return parts.join(' ');
}

/* -------------------------------------------------------------------------- */
/*  Motion Component Helper                                                */
/* -------------------------------------------------------------------------- */

type MotionComponent<T extends React.ElementType> = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<T> & {
    whileHover?: TargetAndTransition;
    whileTap?: TargetAndTransition;
    transition?: Transition;
  } & React.RefAttributes<React.ComponentRef<T>>
>;

function createMotionComponent<T extends React.ElementType>(
  Component: T
): MotionComponent<T> {
  return motion(Component) as unknown as MotionComponent<T>;
}

/* -------------------------------------------------------------------------- */
/*  Button Component                                                        */
/* -------------------------------------------------------------------------- */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      color = 'gold',
      isLoading = false,
      isPressed = false,
      asChild = false,
      as,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedSizeClasses = resolveSizeClasses(size);
    const colorAccent = COLOR_ACCENTS[color];
    const isDisabled = isLoading || disabled;

    const base = cn(
      'group relative inline-flex items-center justify-center rounded-full font-medium',
      'transition-all duration-300 ease-[var(--hexa-ease-interaction)]',
      'focus-visible:outline-none focus-visible:ring-2',
      colorAccent,
      'disabled:opacity-50 disabled:pointer-events-none active:scale-95',
      VARIANT_CLASSES[variant],
      resolvedSizeClasses,
      className
    );

    const showShimmer = variant === 'primary' || variant === 'luxury' || variant === 'glass';

    // As-child composition: clone the child element with our props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: base,
        'aria-disabled': isDisabled || undefined,
        'aria-pressed': isPressed,
      } as React.HTMLAttributes<HTMLElement>);
    }

    // Polymorphic `as` prop
    const MotionWrapper = as ? createMotionComponent(as) : motion.button;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const motionProps: any = as
      ? {}
      : {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 400, damping: 17 } as Transition,
        };

    const ariaProps: Record<string, unknown> = {
      'aria-pressed': isPressed,
    };
    if (isDisabled) {
      ariaProps['aria-disabled'] = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elementProps: any = {
      ref,
      className: base,
      disabled: isDisabled || undefined,
      ...ariaProps,
      ...motionProps,
      ...props,
    };

    return (
      <MotionWrapper {...elementProps}>
        {showShimmer ? <Shimmer /> : null}
        {isLoading ? <LoadingSpinner /> : null}
        {children}
      </MotionWrapper>
    );
  }
);

Button.displayName = 'Button';

Button.displayName = 'Button';