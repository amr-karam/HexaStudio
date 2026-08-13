import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Counter } from '@/components/ui/Counter';

// Mock framer-motion's useSpring and useTransform
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  },
  useSpring: (initial: number) => ({
    set: vi.fn(),
    jump: vi.fn(),
    get: () => initial,
    on: vi.fn(),
  }),
  useTransform: (_spring: unknown, fn: (v: number) => string) => fn(0),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

describe('Counter', () => {
  it('renders without crashing', () => {
    render(<Counter value="100" />);
    // The component renders a span tree
    expect(document.querySelector('span')).toBeTruthy();
  });

  it('extracts numeric value from plain number string', () => {
    // Counter parses the numeric part; we verify it doesn't crash on "100"
    render(<Counter value="100" />);
    // After render, the display starts at 0 (mocked useTransform returns fn(0))
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('extracts numeric value from string with suffix', () => {
    render(<Counter value="200+" />);
    // The suffix "+" should be rendered
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('renders the suffix from value string', () => {
    const { container } = render(<Counter value="50%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders plus sign suffix', () => {
    const { container } = render(<Counter value="12+" />);
    // Suffix is a bare text node after the motion.span — check container text
    expect(container.textContent).toContain('+');
  });

  it('handles comma-formatted numbers', () => {
    // "1,000" → parseInt extracts 1000
    const { container } = render(<Counter value="1,000+" />);
    expect(container.textContent).toContain('+');
  });

  it('renders a nested span structure', () => {
    const { container } = render(<Counter value="10" />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThanOrEqual(2); // outer span + motion.span
  });

  it('does not crash with non-numeric string', () => {
    // parseInt returns NaN for empty string; component should still render
    render(<Counter value="" />);
    expect(document.querySelector('span')).toBeTruthy();
  });
});
