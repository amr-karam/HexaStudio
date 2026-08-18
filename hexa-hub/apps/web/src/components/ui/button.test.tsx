import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { describe, it, expect } from 'vitest';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('custom-class');
  });
});

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders dot when dot prop is true', () => {
    render(<Badge dot>Online</Badge>);
    const badge = screen.getByText('Online').closest('span');
    const dot = badge?.querySelector('span[aria-hidden="true"]');
    expect(dot).toHaveClass('rounded-full');
  });

  it('supports danger variant', () => {
    render(<Badge variant="danger">Error</Badge>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('supports gold variant', () => {
    render(<Badge variant="gold">Premium</Badge>);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});
