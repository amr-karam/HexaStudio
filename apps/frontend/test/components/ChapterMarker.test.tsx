import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChapterMarker, toRomanNumeral } from '@/components/animation/ChapterMarker';

vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({ staticMode: false }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}));

describe('toRomanNumeral', () => {
  it.each([
    [1, 'I'],
    [2, 'II'],
    [4, 'IV'],
    [5, 'V'],
    [9, 'IX'],
    [10, 'X'],
    [14, 'XIV'],
    [40, 'XL'],
    [50, 'L'],
    [90, 'XC'],
    [100, 'C'],
  ])('converts %i to %s', (input, expected) => {
    expect(toRomanNumeral(input)).toBe(expected);
  });

  it('clamps values below 1 to I', () => {
    expect(toRomanNumeral(0)).toBe('I');
    expect(toRomanNumeral(-5)).toBe('I');
  });
});

describe('ChapterMarker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the roman numeral for the given index', () => {
    render(<ChapterMarker index={2} title="Craft" />);
    expect(screen.getByText('(CH. II)')).toBeInTheDocument();
  });

  it('renders the chapter title', () => {
    render(<ChapterMarker index={1} title="Vision" />);
    expect(screen.getByText('Vision')).toBeInTheDocument();
  });

  it('is aria-hidden (decorative)', () => {
    const { container } = render(<ChapterMarker index={3} title="Method" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChapterMarker index={1} title="Vision" className="mt-8" />,
    );
    expect(container.firstChild).toHaveClass('mt-8');
  });

  it('renders in static mode without animation', () => {
    vi.doMock('@/hooks/useMotionPolicy', () => ({
      useMotionPolicy: () => ({ staticMode: true }),
    }));
    render(<ChapterMarker index={1} title="Vision" />);
    expect(screen.getByText('(CH. I)')).toBeInTheDocument();
  });
});
