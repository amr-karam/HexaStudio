'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Heading Component Types                                                */
/* -------------------------------------------------------------------------- */

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_ELEMENT: Record<HeadingLevel, React.ElementType> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

const HEADING_SIZE_CLASSES: Record<number, string> = {
  1: 'heading-hex-1 text-hex-4xl',
  2: 'heading-hex-2 text-hex-3xl',
  3: 'heading-hex-3 text-hex-2xl',
  4: 'heading-hex-4 text-hex-xl',
  5: 'heading-hex-5 text-hex-lg',
  6: 'heading-hex-6 text-hex-md',
} as const;

/* -------------------------------------------------------------------------- */
/*  Heading Component Props                                                */
/* -------------------------------------------------------------------------- */

type HeadingOwnProps = {
  level: HeadingLevel;
  font?: 'serif' | 'sans';
  color?: 'primary' | 'gold' | 'muted';
};

type HeadingProps = HeadingOwnProps & { as?: React.ElementType } & React.HTMLAttributes<HTMLElement>;

/* -------------------------------------------------------------------------- */
/*  Heading Component                                                      */
/* -------------------------------------------------------------------------- */

const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  (
    { level, as, font = 'serif', color = 'primary', className, children, ...rest },
    ref,
  ) => {
    const Component = as ?? HEADING_ELEMENT[level];
    const sizeClass = HEADING_SIZE_CLASSES[level];
    const fontClass = font === 'serif' ? 'font-serif' : 'font-sans';
    const colorClass =
      color === 'gold'
        ? 'heading-gold'
        : color === 'muted'
          ? 'heading-muted'
          : 'heading';

    const classNames = cn('heading', sizeClass, fontClass, colorClass, className);

    return React.createElement(
      Component,
      { ref, className: classNames, ...rest },
      children,
    );
  },
);

Heading.displayName = 'Heading';

/* -------------------------------------------------------------------------- */
/*  Utility: Create a heading factory for a specific level                 */
/* -------------------------------------------------------------------------- */

function createHeading(level: HeadingLevel) {
  const HeadingComponent = React.forwardRef<HTMLElement, HeadingProps>(
    (
      { as, font = 'serif', color = 'primary', className, children, ...props },
      ref,
    ) => {
      const Component = as ?? HEADING_ELEMENT[level];
      const sizeClass = HEADING_SIZE_CLASSES[level];
      const fontClass = font === 'serif' ? 'font-serif' : 'font-sans';
      const colorClass =
        color === 'gold'
          ? 'heading-gold'
          : color === 'muted'
            ? 'heading-muted'
            : 'heading';

      return React.createElement(
        Component,
        { ref, className: cn('heading', sizeClass, fontClass, colorClass, className), ...props },
        children,
      );
    },
  );

  HeadingComponent.displayName = `Heading${level}`;
  return HeadingComponent;
}

export const H1 = createHeading(1);
export const H2 = createHeading(2);
export const H3 = createHeading(3);
export const H4 = createHeading(4);
export const H5 = createHeading(5);
export const H6 = createHeading(6);

export { Heading };
export type { HeadingOwnProps };