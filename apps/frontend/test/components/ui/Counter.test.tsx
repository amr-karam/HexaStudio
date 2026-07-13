import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { Counter } from '@/components/ui/Counter';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
    useTransform: (_: unknown, transform: (v: number) => string) => transform(0),
    motion: {
      span: ({ children, ...props }: Record<string, unknown>) => {
        const { initial: _i, animate: _a, transition: _t, whileInView: _w, viewport: _v, ...rest } = props;
        return <span {...rest}>{children as ReactNode}</span>;
      },
    },
  };
});

describe('Counter', () => {
  it('renders numeric value', () => {
    render(<Counter value="100" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('extracts and displays suffix', () => {
    render(<Counter value="200+" />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('handles value with no suffix', () => {
    render(<Counter value="50" />);
    const container = screen.getByText('0').parentElement;
    expect(container).toHaveTextContent('0');
  });

  it('handles string with multiple suffix characters', () => {
    render(<Counter value="12k+" />);
    expect(screen.getByText('k+')).toBeInTheDocument();
  });
});
