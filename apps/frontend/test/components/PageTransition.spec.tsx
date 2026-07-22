import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { PageTransition } from '@/components/PageTransition';

const { reducedRef } = vi.hoisted(() => ({ reducedRef: { current: false } }));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, variants: _v, custom: _c, ...rest } = props as Record<string, unknown>;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/current',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/hooks/useHEXAMotion', () => ({
  useHEXAMotion: () => ({
    reduced: reducedRef.current,
    ease: { entrance: [0.16, 1, 0.3, 1], interaction: [0.34, 1.56, 0.64, 1], transition: [0.25, 0.1, 0.25, 1], sharp: [0.4, 0, 0.6, 1] },
    duration: { micro: 0.2, component: 0.4, page: 0.75, camera: 1.4 },
    stagger: { micro: 0, component: 0.05, page: 0.1 },
    transition: vi.fn(() => ({ duration: 0.01 })),
    withReduced: vi.fn((v: unknown) => v),
  }),
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

  it('renders content visible under reduced motion', () => {
    reducedRef.current = true;
    render(
      <PageTransition>
        <p>Accessible content</p>
      </PageTransition>,
    );
    expect(screen.getByText('Accessible content')).toBeInTheDocument();
  });
});
