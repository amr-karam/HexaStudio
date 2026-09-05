'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Breakpoint Type                                                        */
/* -------------------------------------------------------------------------- */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/* -------------------------------------------------------------------------- */
/*  Responsive Prop Types                                                  */
/* -------------------------------------------------------------------------- */

export interface ResponsiveCols {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}

export interface ResponsiveFlexDir {
  xs?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  sm?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  md?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  lg?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  xl?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  '2xl'?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
}

/* -------------------------------------------------------------------------- */
/*  Grid Component                                                       */
/* -------------------------------------------------------------------------- */

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  colsResponsive?: ResponsiveCols;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  equalHeight?: boolean;
  inline?: boolean;
}

const GAP_MAP: Record<NonNullable<GridProps['gap']>, string> = {
  none: '0',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)',
  '4xl': 'var(--spacing-4xl)',
};

/**
 * Grid — 12-column responsive grid component.
 *
 * Base columns are set via inline CSS `grid-template-columns`.
 * For responsive column overrides, `colsResponsive` is encoded as
 * `data-responsive-grid` attributes handled by CSS media queries in layout.css.
 *
 * @example
 * <Grid cols={3} gap="lg">...</Grid>
 * <Grid colsResponsive={{ xs: 1, sm: 2, lg: 4 }} gap="md">...</Grid>
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      cols = 1,
      colsResponsive,
      gap = 'lg',
      equalHeight,
      inline,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const effectiveCols = colsResponsive?.xs ?? cols;

    const baseStyles: React.CSSProperties = {
      display: inline ? 'inline-grid' : 'grid',
      gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
      gap: GAP_MAP[gap],
      ...(equalHeight ? { alignItems: 'stretch' } : {}),
    };

    const dataAttr: Record<string, string> = {};
    if (colsResponsive) {
      dataAttr['data-responsive-grid'] = String(colsResponsive.xs ?? cols);
    }

    const classNames = cn('hex-grid', className);

    return (
      <div
        ref={ref}
        className={classNames}
        style={baseStyles}
        data-responsive-grid={dataAttr['data-responsive-grid'] ?? undefined}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Grid.displayName = 'Grid';

/* -------------------------------------------------------------------------- */
/*  Flex Component                                                       */
/* -------------------------------------------------------------------------- */

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  directionResponsive?: ResponsiveFlexDir;
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  grow?: boolean;
  inline?: boolean;
}

const JUSTIFY_MAP: Record<NonNullable<FlexProps['justify']>, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const ALIGN_MAP: Record<NonNullable<FlexProps['align']>, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

/**
 * Flex — flexbox layout component.
 *
 * @example
 * <Flex direction="row" justify="between" align="center" gap="md">
 *   <span>Left</span>
 *   <span>Right</span>
 * </Flex>
 */
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      directionResponsive,
      align = 'center',
      justify = 'start',
      wrap,
      gap,
      grow,
      inline,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const effectiveDirection = (directionResponsive?.xs ?? direction) as React.CSSProperties['flexDirection'];
    const dirClass =
      (effectiveDirection as string) === 'row-reverse'
        ? 'hex-flex-reverse'
        : (effectiveDirection as string) === 'column-reverse'
          ? 'hex-flex-col-reverse'
          : (effectiveDirection as string) === 'column'
            ? 'hex-flex-col'
            : 'hex-flex-row';

    const classNames = cn(
      inline ? 'hex-inline-flex' : 'hex-flex',
      dirClass,
      justify !== 'start' ? JUSTIFY_MAP[justify] : '',
      align ? ALIGN_MAP[align] : '',
      wrap ? 'hex-flex-wrap' : 'hex-flex-nowrap',
      grow ? 'hex-grow' : 'hex-grow-0',
      gap ? `hex-gap-${gap}` : '',
      className,
    );

    const dataFlexDir = directionResponsive?.xs ?? direction;

    return (
      <div
        ref={ref}
        className={classNames}
        data-responsive-flex={dataFlexDir}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Flex.displayName = 'Flex';

/* -------------------------------------------------------------------------- */
/*  Box Component                                                        */
/* -------------------------------------------------------------------------- */

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  display?: 'flex' | 'inline-flex' | 'block' | 'inline-block' | 'grid' | 'none';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  paddingX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  paddingY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  bg?: string;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  grow?: boolean;
  shrink?: boolean;
}

const BOX_PADDING_MAP: Record<NonNullable<BoxProps['padding']>, string> = {
  none: '0',
  xs: 'var(--spacing-xs)',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)',
  '4xl': 'var(--spacing-4xl)',
};

const BOX_ROUNDED_MAP: Record<NonNullable<BoxProps['rounded']>, string> = {
  none: '0',
  sm: 'var(--spacing-xs)',
  md: 'var(--spacing-sm)',
  lg: 'var(--spacing-md)',
  xl: 'var(--spacing-lg)',
  '2xl': 'var(--spacing-2xl)',
  full: '9999px',
};

/**
 * Box — primitive layout primitive for composing any CSS property set.
 *
 * @example
 * <Box as="section" display="grid" gap="lg" padding="xl" rounded="xl">
 *   Content
 * </Box>
 */
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      display,
      gap,
      direction,
      align,
      justify,
      wrap,
      padding,
      paddingX,
      paddingY,
      rounded,
      bg,
      width,
      maxWidth,
      minHeight,
      grow,
      shrink,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const style: React.CSSProperties = {};
    if (display) style.display = display;
    if (gap) style.gap = BOX_PADDING_MAP[gap];
    if (direction) style.flexDirection = direction as React.CSSProperties['flexDirection'];
    if (align) style.alignItems = align;
    if (justify) style.justifyContent = justify;
    if (wrap !== undefined) style.flexWrap = wrap ? 'wrap' : 'nowrap';
    if (padding) style.padding = BOX_PADDING_MAP[padding];
    if (paddingX) style.paddingInline = BOX_PADDING_MAP[paddingX];
    if (paddingY) style.paddingBlock = BOX_PADDING_MAP[paddingY];
    if (rounded) style.borderRadius = BOX_ROUNDED_MAP[rounded];
    if (bg) style.backgroundColor = bg;
    if (width) style.width = width;
    if (maxWidth) style.maxWidth = maxWidth;
    if (minHeight) style.minHeight = minHeight;
    if (grow) style.flexGrow = 1;
    if (shrink === false) style.flexShrink = 0;

    const classNames = cn(className);

    return (
      <div
        ref={ref}
        className={classNames}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Box.displayName = 'Box';

/* -------------------------------------------------------------------------- */
/*  GridCell Component                                                   */
/* -------------------------------------------------------------------------- */

export interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
  spanResponsive?: ResponsiveCols;
  offset?: number;
  start?: number;
  end?: number;
}

const COL_SPAN_MAP: Record<number, string> = {
  1: 'hex-col-span-1',
  2: 'hex-col-span-2',
  3: 'hex-col-span-3',
  4: 'hex-col-span-4',
  5: 'hex-col-span-5',
  6: 'hex-col-span-6',
  7: 'hex-col-span-7',
  8: 'hex-col-span-8',
  9: 'hex-col-span-9',
  10: 'hex-col-span-10',
  11: 'hex-col-span-11',
  12: 'hex-col-span-12',
};

/**
 * GridCell — a single cell within a Grid that can span multiple columns.
 *
 * @example
 * <Grid cols={12} gap="md">
 *   <GridCell span={8}>Main content</GridCell>
 *   <GridCell span={4}>Sidebar</GridCell>
 * </Grid>
 */
export const GridCell = React.forwardRef<HTMLDivElement, GridCellProps>(
  (
    {
      span = 12,
      spanResponsive: _spanResponsive,
      offset,
      start,
      end,
      className,
      ...props
    },
    ref,
  ) => {
    const classNames = cn(
      COL_SPAN_MAP[span] ?? 'hex-col-span-12',
      className,
    );

    const style: React.CSSProperties = {};
    if (start) style.gridColumnStart = start;
    if (end) style.gridColumnEnd = end;
    if (offset) style.gridColumn = `span ${offset} / span ${offset}`;

    return (
      <div
        ref={ref}
        className={classNames}
        style={style}
        {...props}
      />
    );
  },
);
GridCell.displayName = 'GridCell';
