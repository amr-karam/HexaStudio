'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */

export type CardElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'glass';
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type CardGutter = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Responsive breakpoint values matching the layout system (xs < 640px, sm 640+, md 768+, lg 1024+, xl 1280+, 2xl 1536+) */
export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface CardRootOwnProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual elevation depth */
  elevation?: CardElevation;
  /** Enable interactive (clickable) mode with hover lift */
  interactive?: boolean;
  /** Responsive padding values per breakpoint */
  paddingResponsive?: ResponsiveValue<CardPadding>;
  /** Responsive gap between sections */
  gapResponsive?: ResponsiveValue<CardGutter>;
  /** Rendered semantic element */
  as?: 'div' | 'article' | 'section' | 'aside';
}

/* -------------------------------------------------------------------------- */
/*  Elevation / shadow tokens                                                */
/* -------------------------------------------------------------------------- */

const ELEVATION_MAP: Record<NonNullable<CardElevation>, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm shadow-black/20',
  md: 'shadow-md shadow-black/30',
  lg: 'shadow-lg shadow-black/40',
  xl: 'shadow-xl shadow-black/50',
  '2xl': 'shadow-2xl shadow-black/60',
  glass:
    'shadow-[var(--artisan-glass-shadow),var(--artisan-glass-highlight)]',
};

/* -------------------------------------------------------------------------- */
/*  Interactive animation props                                              */
/* -------------------------------------------------------------------------- */

const INTERACTIVE_HOVER = {
  y: -4,
  scale: 1.01,
  boxShadow: '0 20px 60px -20px rgba(212, 175, 55, 0.15)',
  transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
};

const INTERACTIVE_TAP = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

/* -------------------------------------------------------------------------- */
/*  Padding / gap scale                                                    */
/* -------------------------------------------------------------------------- */

const PADDING_SCALE: Record<NonNullable<CardPadding>, string> = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
  xl: 'p-6',
  '2xl': 'p-8',
};

const GUTTER_SCALE: Record<NonNullable<CardGutter>, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
  '2xl': 'gap-8',
};

const PADDING_RESPONSIVE_MAP: Record<NonNullable<CardPadding>, string> = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'sm:p-2',
  md: 'md:p-3',
  lg: 'lg:p-4',
  xl: 'xl:p-6',
  '2xl': '2xl:p-8',
};

/* -------------------------------------------------------------------------- */
/*  Responsive value builder                                             */
/* -------------------------------------------------------------------------- */

function buildResponsiveClasses<T>(
  value: ResponsiveValue<T> | undefined,
  mapper: (v: T) => string,
): string {
  if (!value) return '';
  const classes: string[] = [];
  if (value.base !== undefined) classes.push(mapper(value.base));
  if (value.sm !== undefined) classes.push(`sm:${mapper(value.sm)}`);
  if (value.md !== undefined) classes.push(`md:${mapper(value.md)}`);
  if (value.lg !== undefined) classes.push(`lg:${mapper(value.lg)}`);
  if (value.xl !== undefined) classes.push(`xl:${mapper(value.xl)}`);
  if (value['2xl'] !== undefined) classes.push(`2xl:${mapper(value['2xl'])}`);
  return classes.join(' ') || '';
}

/* -------------------------------------------------------------------------- */
/*  Card.Root — compound root container                                    */
/* -------------------------------------------------------------------------- */

export type CardRootProps = CardRootOwnProps;

const CARD_ELEMENT_MAP: Record<NonNullable<CardRootOwnProps['as']>, React.ElementType> = {
  div: motion.div,
  article: motion.article,
  section: motion.section,
  aside: motion.aside,
};

const CardRoot = React.forwardRef<HTMLElement, CardRootProps>(
  (
    {
      elevation = 'sm',
      interactive = false,
      as = 'div',
      className,
      paddingResponsive,
      gapResponsive,
      children,
      ...props
    },
    ref,
  ) => {
    const reducedMotion = useReducedMotion();
    const isInteractive = interactive && !reducedMotion;

    const paddingClasses = buildResponsiveClasses(
      paddingResponsive,
      (v) => PADDING_RESPONSIVE_MAP[v] ?? PADDING_SCALE[v],
    );

    const gapClasses = buildResponsiveClasses(
      gapResponsive,
      (v) => GUTTER_SCALE[v],
    );

    const MotionTag = (CARD_ELEMENT_MAP[as] ?? motion.div) as React.FC<
      React.HTMLAttributes<HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
        whileHover?: boolean | object;
        whileTap?: boolean | object;
        transition?: object;
      }
    >;

    return (
      <MotionTag
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl border border-sl-gold-subtle/10 bg-surface',
          ELEVATION_MAP[elevation],
          isInteractive && 'cursor-pointer',
          paddingClasses,
          gapClasses,
          className,
        )}
        whileHover={isInteractive ? INTERACTIVE_HOVER : undefined}
        whileTap={isInteractive ? INTERACTIVE_TAP : undefined}
        transition={INTERACTIVE_HOVER.transition}
        {...props}
      >
        {children}
      </MotionTag>
    );
  },
);
CardRoot.displayName = 'Card.Root';

/* -------------------------------------------------------------------------- */
/*  Card.Header — optional card header region                                */
/* -------------------------------------------------------------------------- */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Bottom gutter between header and body */
  gutter?: CardGutter;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, gutter = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex-shrink-0 border-b border-sl-gold-subtle/10',
          gutter && `pb-${gutter}`,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardHeader.displayName = 'Card.Header';

/* -------------------------------------------------------------------------- */
/*  Card.Body — main content region with responsive padding              */
/* -------------------------------------------------------------------------- */

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Responsive padding override */
  padding?: ResponsiveValue<CardPadding>;
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, padding, className, ...props }, ref) => {
    const paddingClasses = buildResponsiveClasses(
      padding,
      (v) => PADDING_RESPONSIVE_MAP[v] ?? PADDING_SCALE[v],
    );

    return (
      <div
        ref={ref}
        className={cn('flex-1 min-w-0', paddingClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardBody.displayName = 'Card.Body';

/* -------------------------------------------------------------------------- */
/*  Card.Footer — optional card footer region                                */
/* -------------------------------------------------------------------------- */

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Top margin separating footer from body */
  gutter?: CardGutter;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-shrink-0 border-t border-sl-gold-subtle/10', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardFooter.displayName = 'Card.Footer';

/* -------------------------------------------------------------------------- */
/*  Compound Card export                                                   */
/* -------------------------------------------------------------------------- */

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
