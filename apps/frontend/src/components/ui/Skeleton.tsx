import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton = ({ className, variant = 'text' }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-neutral-800',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'rectangular' && 'rounded-lg',
        variant === 'card' && 'h-48 w-full rounded-xl',
        className,
      )}
    />
  );
};
