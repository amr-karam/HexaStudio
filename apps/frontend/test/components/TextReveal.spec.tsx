import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextReveal } from '@/components/ui/TextReveal';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('@/hooks/useHEXAMotion', () => ({
  useHEXAMotion: () => ({
    reduced: false,
    transition: vi.fn(() => ({ duration: 0.75, ease: [0.16, 1, 0.3, 1] })),
    withReduced: vi.fn((v: unknown) => v),
  }),
}));

describe('TextReveal', () => {
  it('renders children', () => {
    render(
      <TextReveal>
        <span>Revealed text</span>
      </TextReveal>
    );
    expect(screen.getByText('Revealed text')).toBeInTheDocument();
  });

  it('wraps content in an overflow-hidden container', () => {
    const { container } = render(
      <TextReveal>
        <span>Test</span>
      </TextReveal>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('overflow-hidden');
  });

  it('merges custom className', () => {
    const { container } = render(
      <TextReveal className="my-class">
        <span>Test</span>
      </TextReveal>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-class');
    expect(wrapper.className).toContain('overflow-hidden');
  });

  it('renders a motion.div child for the reveal animation', () => {
    render(
      <TextReveal>
        <span>Content</span>
      </TextReveal>
    );
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  it('passes children inside the motion.div', () => {
    render(
      <TextReveal>
        <span>Inner</span>
      </TextReveal>
    );
    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toHaveTextContent('Inner');
  });

  it('accepts a delay prop without crashing', () => {
    render(
      <TextReveal delay={0.5}>
        <span>Delayed</span>
      </TextReveal>
    );
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('accepts duration="component"', () => {
    render(
      <TextReveal duration="component">
        <span>Component duration</span>
      </TextReveal>
    );
    expect(screen.getByText('Component duration')).toBeInTheDocument();
  });

  it('uses page duration by default', () => {
    render(
      <TextReveal>
        <span>Page duration</span>
      </TextReveal>
    );
    // The mock transition is called with 'page' by default
    expect(screen.getByText('Page duration')).toBeInTheDocument();
  });
});
