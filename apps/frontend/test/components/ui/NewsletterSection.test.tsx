import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { NewsletterSection } from '@/components/ui/NewsletterSection';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, whileInView: _w, viewport: _v, transition: _t, ...rest } = props;
      return <span {...rest}>{children as ReactNode}</span>;
    },
    h2: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, whileInView: _w, viewport: _v, transition: _t, ...rest } = props;
      return <h2 {...rest}>{children as ReactNode}</h2>;
    },
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial: _i, whileInView: _w, viewport: _v, transition: _t, ...rest } = props;
      return <div {...rest}>{children as ReactNode}</div>;
    },
  },
}));

// Mock the Button re-export
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children as ReactNode}</button>
  ),
}));

// Mock the Input re-export
vi.mock('@/components/ui/inputs/Input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

describe('NewsletterSection', () => {
  it('renders the heading text', () => {
    render(<NewsletterSection />);
    expect(screen.getByText(/Join the/)).toBeInTheDocument();
    expect(screen.getByText('Inner Circle.')).toBeInTheDocument();
  });

  it('renders the "Stay Informed" label', () => {
    render(<NewsletterSection />);
    expect(screen.getByText('Stay Informed')).toBeInTheDocument();
  });

  it('renders the email input', () => {
    render(<NewsletterSection />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('renders the Subscribe button', () => {
    render(<NewsletterSection />);
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('renders the disclaimer text', () => {
    render(<NewsletterSection />);
    expect(screen.getByText(/No spam/)).toBeInTheDocument();
  });
});
