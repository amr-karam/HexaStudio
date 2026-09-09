'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Text Component Types                                                 */
/* -------------------------------------------------------------------------- */

export type TextVariant = 'body' | 'lead' | 'small' | 'caption' | 'mono';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'inverse';

type TextOwnProps = {
  variant?: TextVariant;
  color?: TextColor;
  strong?: boolean;
  as?: React.ElementType;
};

type TextProps = TextOwnProps & React.HTMLAttributes<HTMLDivElement>;

/* -------------------------------------------------------------------------- */
/*  Text Style Mapping                                                   */
/* -------------------------------------------------------------------------- */

const VARIANT_CLASSES: Record<TextVariant, string> = {
  body: 'text-hex-base body-text',
  lead: 'text-hex-lg font-serif',
  small: 'text-hex-sm',
  caption: 'text-hex-xs',
  mono: 'font-mono text-hex-sm',
};

const COLOR_CLASSES: Record<TextColor, string> = {
  primary: 'text-hex-primary',
  secondary: 'text-hex-secondary',
  muted: 'text-hex-muted',
  accent: 'text-hex-accent',
  inverse: 'text-hex-primary',
};

/* -------------------------------------------------------------------------- */
/*  Text Component                                                       */
/* -------------------------------------------------------------------------- */

const Text = React.forwardRef<HTMLDivElement, TextProps>(
  (
    { variant = 'body', color = 'secondary', strong, className, children, ...rest },
    ref,
  ) => {
    const Component = rest.as ?? (variant === 'lead' ? 'p' : 'span');
    delete (rest as Record<string, unknown>).as;
    const restWithoutAs = rest;

    const variantClass = VARIANT_CLASSES[variant];
    const colorClass = COLOR_CLASSES[color];
    const strongClass = strong ? 'font-semibold' : '';

    const classNames = cn('body', variantClass, colorClass, strongClass, className);

    return React.createElement(
      Component,
      { ref, className: classNames, ...restWithoutAs },
      children,
    );
  },
);

Text.displayName = 'Text';

/* -------------------------------------------------------------------------- */
/*  Semantic Text Components                                             */
/* -------------------------------------------------------------------------- */

export const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-hex-lg font-serif text-hex-primary', className)} {...props}>
      {children}
    </p>
  ),
);
Lead.displayName = 'Lead';

export const Small = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <small ref={ref} className={cn('text-hex-sm text-hex-secondary', className)} {...props}>
      {children}
    </small>
  ),
);
Small.displayName = 'Small';

export const Caption = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn('text-hex-xs text-hex-muted', className)} {...props}>
      {children}
    </span>
  ),
);
Caption.displayName = 'Caption';

export const Mono = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <code ref={ref} className={cn('font-mono text-hex-sm text-hex-accent', className)} {...props}>
      {children}
    </code>
  ),
);
Mono.displayName = 'Mono';

export { Text };
export type { TextOwnProps };