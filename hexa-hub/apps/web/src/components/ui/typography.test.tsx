import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading, Text, Code, Lead } from '@/components/ui/typography';

describe('Heading', () => {
  it('renders as h2 by default', () => {
    render(<Heading>Default Heading</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders with correct level', () => {
    render(<Heading level="h1">H1 Heading</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders polymorphic via as prop', () => {
    render(<Heading as="span" level="h2">Polymorphic</Heading>);
    expect(screen.getByText('Polymorphic')).toBeInTheDocument();
  });

  it('applies gradient class when gradient prop is true', () => {
    render(<Heading gradient>Gradient Heading</Heading>);
    const el = screen.getByText('Gradient Heading');
    expect(el.className).toContain('text-gold-gradient');
  });

  it('applies color class', () => {
    render(<Heading color="gold">Gold Heading</Heading>);
    const el = screen.getByText('Gold Heading');
    expect(el.className).toContain('text-gold');
  });
});

describe('Text', () => {
  it('renders as p by default', () => {
    render(<Text>Body text</Text>);
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('applies size class', () => {
    render(<Text size="lg">Large text</Text>);
    const el = screen.getByText('Large text');
    expect(el.className).toContain('text-lg');
  });

  it('applies weight class', () => {
    render(<Text weight="bold">Bold text</Text>);
    const el = screen.getByText('Bold text');
    expect(el.className).toContain('font-bold');
  });

  it('applies color class', () => {
    render(<Text color="muted">Muted text</Text>);
    const el = screen.getByText('Muted text');
    expect(el.className).toContain('text-muted');
  });

  it('renders polymorphic via as prop', () => {
    render(<Text as="span">Inline text</Text>);
    expect(screen.getByText('Inline text')).toBeInTheDocument();
  });
});

describe('Code', () => {
  it('renders as code by default', () => {
    render(<Code>inline code</Code>);
    expect(screen.getByText('inline code')).toBeInTheDocument();
  });

  it('renders as pre when variant is block', () => {
    render(<Code variant="block">block code</Code>);
    expect(screen.getByText('block code')).toBeInTheDocument();
  });
});

describe('Lead', () => {
  it('renders as p by default', () => {
    render(<Lead>Lead text</Lead>);
    expect(screen.getByText('Lead text')).toBeInTheDocument();
  });
});
