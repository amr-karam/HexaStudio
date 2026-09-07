'use client';

import React from 'react';
import { cn } from '@/components/ui/cn';

/* ─── Type Scale Tokens ────────────────────────────────────────
   Responsive scale mirrors the CSS custom properties in globals.css.
   Each heading level maps to a responsive font-size class string
   using Tailwind's native responsive prefix syntax (e.g. "sm:text-5xl").
   These classes are resolved at build time by Tailwind's JIT compiler,
   not at runtime — ensuring zero CSS-in-JS overhead and SSR safety.
────────────────────────────────────────────────────────────────────── */

const headingScale: Record<string, string[]> = {
  h1: ['text-4xl', 'sm:text-5xl', 'md:text-5xl', 'lg:text-6xl', 'xl:text-6xl', '2xl:text-7xl'],
  h2: ['text-3xl', 'sm:text-4xl', 'md:text-4xl', 'lg:text-5xl', 'xl:text-5xl', '2xl:text-6xl'],
  h3: ['text-2xl', 'sm:text-2xl', 'md:text-3xl', 'lg:text-4xl', 'xl:text-4xl', '2xl:text-5xl'],
  h4: ['text-xl', 'sm:text-2xl', 'md:text-2xl', 'lg:text-3xl', 'xl:text-3xl', '2xl:text-4xl'],
  h5: ['text-lg', 'sm:text-xl', 'md:text-xl', 'lg:text-2xl', 'xl:text-2xl', '2xl:text-3xl'],
  h6: ['text-base', 'sm:text-lg', 'md:text-lg', 'lg:text-xl', 'xl:text-xl', '2xl:text-2xl'],
};

const headingStyleConfig: Record<string, { fontWeight: string; lineHeight: string; letterSpacing: string }> = {
  h1: { fontWeight: 'font-medium', lineHeight: 'leading-[1.1]', letterSpacing: 'tracking-[-0.02em]' },
  h2: { fontWeight: 'font-medium', lineHeight: 'leading-[1.15]', letterSpacing: 'tracking-[-0.015em]' },
  h3: { fontWeight: 'font-medium', lineHeight: 'leading-[1.2]', letterSpacing: 'tracking-[-0.01em]' },
  h4: { fontWeight: 'font-medium', lineHeight: 'leading-[1.25]', letterSpacing: 'tracking-[-0.005em]' },
  h5: { fontWeight: 'font-medium', lineHeight: 'leading-[1.3]', letterSpacing: 'tracking-[-0.002em]' },
  h6: { fontWeight: 'font-medium', lineHeight: 'leading-[1.4]', letterSpacing: 'tracking-normal' },
};

/* ─── Heading Component ────────────────────────────────────────
   Polymorphic: renders as h1–h6 by default, but `as` prop overrides.
   Responsive: auto-adjusts font-size at each breakpoint via
   Tailwind responsive utility classes built from the type-scale tokens.
   Uses `as` prop for polymorphic rendering — no CSS-in-JS, SSR-safe.
────────────────────────────────────────────────────────────────────── */

export interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  /** Heading level — determines type-scale tokens (default: 'h2') */
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Polymorphic `as` prop to render as a different element */
  as?: React.ElementType;
  /** Visual weight variant */
  variant?: 'display' | 'subtitle' | 'body';
  /** Optional color override */
  color?: 'primary' | 'secondary' | 'gold' | 'muted' | 'foreground';
  /** Gradient gold accent text */
  gradient?: boolean;
}

const colorClasses: Record<string, string> = {
  primary: 'text-foreground',
  secondary: 'text-secondary',
  gold: 'text-gold',
  muted: 'text-muted',
  foreground: 'text-foreground',
};

const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  (
    {
      level = 'h2',
      as,
      variant = 'subtitle',
      color = 'primary',
      gradient = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = as || level;
    const styleConfig = headingStyleConfig[level] || headingStyleConfig.h2;

    const classes = cn(
      // Responsive type-scale classes (Tailwind JIT resolves these)
      ...headingScale[level] || headingScale.h2,
      // Base style config
      styleConfig.fontWeight,
      styleConfig.lineHeight,
      styleConfig.letterSpacing,
      // Variant adjustments
      variant === 'display' && 'font-bold',
      variant === 'body' && 'font-normal',
      // Color
      colorClasses[color],
      // Gradient
      gradient && 'text-gold-gradient',
      className,
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  },
);

Heading.displayName = 'Heading';

/* ─── Text Component ─────────────────────────────────────────── */

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Text size variant mapped to type-scale tokens */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Visual weight */
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'gold' | 'foreground' | 'tertiary';
  /** Render as a different element */
  as?: React.ElementType;
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Number of lines to clamp */
  lines?: number;
}

const textSizeClasses: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
};

const textWeightClasses: Record<string, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  bold: 'font-bold',
};

const textColorClasses: Record<string, string> = {
  primary: 'text-foreground',
  secondary: 'text-secondary',
  muted: 'text-muted',
  gold: 'text-gold',
  foreground: 'text-foreground',
  tertiary: 'text-tertiary',
};

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      size = 'base',
      weight = 'regular',
      color = 'primary',
      as,
      truncate = false,
      lines,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = as || 'p';

    const classes = cn(
      textSizeClasses[size],
      textWeightClasses[weight],
      textColorClasses[color],
      truncate && 'truncate',
      lines && `line-clamp-${lines}`,
      className,
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  },
);

Text.displayName = 'Text';

/* ─── Code Component ─────────────────────────────────────────── */

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /** Render as inline `<code>` or block `<pre>` */
  variant?: 'inline' | 'block';
  /** Programming language for syntax highlighting hint */
  language?: string;
  /** Render as a different element */
  as?: React.ElementType;
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  (
    {
      variant = 'inline',
      language,
      as,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = as || (variant === 'block' ? 'pre' : 'code');

    const classes = cn(
      'font-mono',
      variant === 'inline'
        ? 'text-sm bg-surface-elevated border border-border px-1.5 py-0.5 rounded text-gold'
        : 'block bg-void-deep border border-border rounded-lg p-4 text-sm overflow-x-auto text-foreground',
      className,
    );

    return (
      <Component ref={ref} className={classes} data-language={language} {...props}>
        {children}
      </Component>
    );
  },
);

Code.displayName = 'Code';

/* ─── Lead Component ─────────────────────────────────────────── */

export interface LeadProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: React.ElementType;
}

const Lead = React.forwardRef<HTMLParagraphElement, LeadProps>(
  ({ className, children, as, ...props }, ref) => {
    const Component = as || 'p';
    const classes = cn(
      'text-lg leading-relaxed text-secondary font-light sm:text-xl',
      className,
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  },
);

Lead.displayName = 'Lead';

/* ─── Exports ────────────────────────────────────────── */
export { Heading, Text, Code, Lead };
