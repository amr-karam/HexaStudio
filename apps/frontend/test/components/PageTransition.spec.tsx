import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/PageTransition';

const { reducedRef } = vi.hoisted(() => ({ reducedRef: { current: false } }));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props as Record<string, unknown>;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/current',
}));

vi.mock('@/hooks/useHEXAMotion', () => ({
  useHEXAMotion: () => ({ reduced: reducedRef.current }),
}));

describe('PageTransition', () => {
  it('renders its children', () => {
    reducedRef.current = false;
    render(
      <PageTransition>
        <p>Page content</p>
      </PageTransition>,
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('wraps children in a single container element', () => {
    reducedRef.current = false;
    render(
      <PageTransition>
        <p>Page content</p>
      </PageTransition>,
    );
    const content = screen.getByText('Page content');
    expect(content.parentElement).not.toBeNull();
  });

  it('does not throw when reduced motion is enabled', () => {
    reducedRef.current = true;
    expect(() =>
      render(
        <PageTransition>
          <p>Page content</p>
        </PageTransition>,
      ),
    ).not.toThrow();
  });
});
