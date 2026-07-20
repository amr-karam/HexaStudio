import { cn } from '@/lib/utils';

type ShimmerSkeletonVariant = 'text' | 'circle' | 'rect';

interface ShimmerSkeletonProps {
  className?: string;
  variant?: ShimmerSkeletonVariant;
}

const VARIANT_CLASSES: Record<ShimmerSkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  circle: 'rounded-full',
  rect: 'rounded-2xl',
};

/**
 * ShimmerSkeleton — a branded loading placeholder that uses the `.shimmer`
 * utility from globals.css. Unlike a plain pulse, the sweeping gradient reads
 * as a deliberate, luxurious "data arriving" cue that matches the obsidian +
 * champagne palette.
 *
 * Purely presentational — no client directives or hooks required.
 */
export const ShimmerSkeleton = ({
  className,
  variant = 'rect',
}: ShimmerSkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn('shimmer', VARIANT_CLASSES[variant], className)}
    />
  );
};
