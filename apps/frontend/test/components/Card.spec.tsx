import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { Card } from '@/components/ui/cards/Card';

// motion.div passthrough mock — strips framer-motion-only props and renders a
// plain <div> so jsdom tests don't depend on animation side effects.
vi.mock('framer-motion', () => {
  const filterProps = (props: Record<string, unknown>) => {
    const motionOnly = new Set<string>([
      'variants', 'initial', 'animate', 'exit', 'whileInView',
      'whileHover', 'whileTap', 'viewport', 'custom', 'transition',
      'onViewportEnter', 'onViewportLeave',
    ]);
    return Object.fromEntries(
      Object.entries(props).filter(([k]) => !motionOnly.has(k)),
    );
  };
  return {
    motion: {
      div: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
        <div className={className} {...filterProps(props)}>{children}</div>
      ),
    },
  };
});

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

afterEach(() => {
  cleanup();
});

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <span>Child content</span>
      </Card>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    const { container } = render(
      <Card className="test-class">
        <span>Child</span>
      </Card>,
    );
    expect(container.querySelector('div.test-class')).toBeTruthy();
  });

  it('applies the default sm elevation', () => {
    const { container } = render(
      <Card>
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-sm');
  });

  it('applies elevation classes', () => {
    const { container } = render(
      <Card elevation="lg">
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-lg');
  });

  it('applies glass elevation', () => {
    const { container } = render(
      <Card elevation="glass">
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('artisan-glass');
  });

  it('applies interactive cursor pointer when interactive=true', () => {
    const { container } = render(
      <Card interactive>
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('cursor-pointer');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-class');
  });

  it('renders Card.Header with children', () => {
    render(
      <Card>
        <Card.Header>Header content</Card.Header>
      </Card>,
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders Card.Body with children', () => {
    render(
      <Card>
        <Card.Body>Body content</Card.Body>
      </Card>,
    );
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders Card.Footer with children', () => {
    render(
      <Card>
        <Card.Footer>Footer content</Card.Footer>
      </Card>,
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders with full compound structure', () => {
    render(
      <Card elevation="md" interactive>
        <Card.Header>
          <h3>Title</h3>
        </Card.Header>
        <Card.Body>Body content</Card.Body>
        <Card.Footer>Footer content</Card.Footer>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('does not apply interactive styles when interactive=false', () => {
    const { container } = render(
      <Card interactive={false}>
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('cursor-pointer');
  });

  it('merges padding classes from paddingResponsive', () => {
    const { container } = render(
      <Card paddingResponsive={{ base: 'md', lg: 'xl' }}>
        <span>Child</span>
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('p-3');
  });
});
