import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { TextReveal } from '@/components/ui/TextReveal';

// Mock framer-motion to render children without animation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, animate: _a, transition: _t, whileInView: _w, viewport: _v, ...rest } = props;
      return <div {...rest}>{children as ReactNode}</div>;
    },
  },
}));

describe('TextReveal', () => {
  it('renders children', () => {
    render(<TextReveal>Hello World</TextReveal>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TextReveal className="custom-class">Text</TextReveal>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with overflow-hidden class by default', () => {
    const { container } = render(<TextReveal>Text</TextReveal>);
    expect(container.firstChild).toHaveClass('overflow-hidden');
  });

  it('renders nested elements', () => {
    render(
      <TextReveal>
        <span data-testid="inner">Inner content</span>
      </TextReveal>
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});
