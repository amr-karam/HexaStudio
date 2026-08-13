import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

describe('Skeleton', () => {
  it('renders a div', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('applies animate-pulse by default', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('animate-pulse');
  });

  it('uses text variant by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-full');
    expect(el.className).toContain('rounded');
  });

  it('applies circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
  });

  it('applies rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-lg');
  });

  it('applies card variant', () => {
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-48');
    expect(el.className).toContain('rounded-xl');
  });

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="custom-w" />);
    expect((container.firstChild as HTMLElement).className).toContain('custom-w');
  });

  it('uses bg-neutral-800 background', () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('bg-neutral-800');
  });
});

describe('ShimmerSkeleton', () => {
  it('renders a div', () => {
    const { container } = render(<ShimmerSkeleton />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('applies shimmer class', () => {
    const { container } = render(<ShimmerSkeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('shimmer');
  });

  it('uses rect variant by default', () => {
    const { container } = render(<ShimmerSkeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-2xl');
  });

  it('applies text variant', () => {
    const { container } = render(<ShimmerSkeleton variant="text" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-full');
    expect(el.className).toContain('rounded');
  });

  it('applies circle variant', () => {
    const { container } = render(<ShimmerSkeleton variant="circle" />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full');
  });

  it('merges custom className', () => {
    const { container } = render(<ShimmerSkeleton className="custom" />);
    expect((container.firstChild as HTMLElement).className).toContain('custom');
  });

  it('sets aria-hidden for screen readers', () => {
    const { container } = render(<ShimmerSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
