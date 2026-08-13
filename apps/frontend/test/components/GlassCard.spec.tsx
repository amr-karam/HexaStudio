import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui/GlassCard';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <div className={className} {...props}>{children}</div>
    ),
    article: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <article className={className} {...props}>{children}</article>
    ),
    section: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <section className={className} {...props}>{children}</section>
    ),
  },
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('@/lib/motion', () => ({
  EASE: { entrance: [0.16, 1, 0.3, 1] },
  DURATION: { component: 0.4 },
}));

describe('GlassCard', () => {
  it('renders children', () => {
    render(
      <GlassCard>
        <span>Glass content</span>
      </GlassCard>
    );
    expect(screen.getByText('Glass content')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as an article when as="article"', () => {
    render(
      <GlassCard as="article">
        <span>Article content</span>
      </GlassCard>
    );
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders as a section when as="section"', () => {
    render(
      <GlassCard as="section">
        <span>Section content</span>
      </GlassCard>
    );
    expect(document.querySelector('section')).toBeTruthy();
  });

  it('applies the default variant (glass class)', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('glass');
  });

  it('applies the elevated variant', () => {
    const { container } = render(<GlassCard variant="elevated">Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-');
  });

  it('applies the subtle variant (no glass blur class)', () => {
    const { container } = render(<GlassCard variant="subtle">Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-white');
    // The subtle variant should not have the standalone 'glass' class (only 'glass-hover' may appear)
    const classes = card.className.split(/\s+/);
    expect(classes).not.toContain('glass');
  });

  it('applies glass-hover when hover is enabled (default)', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('glass-hover');
  });

  it('does not apply glass-hover when hover={false}', () => {
    const { container } = render(<GlassCard hover={false}>Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('glass-hover');
  });

  it('merges custom className', () => {
    const { container } = render(<GlassCard className="my-custom">Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('my-custom');
  });

  it('always applies rounded-2xl', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-2xl');
  });

  it('applies transition-colors for smooth hover', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('transition-colors');
  });
});
