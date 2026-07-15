import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial: _i, whileInView: _w, viewport: _v, transition: _t, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

describe('ScrollFadeIn', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ScrollFadeIn>
        <span>Hello Fade In</span>
      </ScrollFadeIn>
    );
    expect(getByText('Hello Fade In')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollFadeIn className="custom-class">
        <span>Content</span>
      </ScrollFadeIn>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders nested content', () => {
    const { getByText } = render(
      <ScrollFadeIn>
        <div>
          <p>Nested paragraph</p>
        </div>
      </ScrollFadeIn>
    );
    expect(getByText('Nested paragraph')).toBeInTheDocument();
  });
});
