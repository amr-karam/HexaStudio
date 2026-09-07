import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { HomeSections } from '@/features/portfolio/components/HomeSections';

// Mock framer-motion — render plain elements stripping motion-only props
vi.mock('framer-motion', () => {
  const filterProps = (props: Record<string, unknown>) => {
    const motionOnly = new Set<string>([
      'variants', 'initial', 'animate', 'exit', 'whileInView',
      'whileHover', 'whileTap', 'viewport', 'custom', 'transition',
      'onViewportEnter', 'onViewportLeave',
    ]);
    return Object.fromEntries(
      Object.entries(props).filter(([k]) => !motionOnly.has(k)),
    );
  };
  return {
    motion: {
      div: ({ children, ...props }: Record<string, unknown>) => (
        <div {...filterProps(props)}>{children}</div>
      ),
      span: ({ children, ...props }: Record<string, unknown>) => (
        <span {...filterProps(props)}>{children}</span>
      ),
    },
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: (_: unknown, __: unknown, range: number[]) => range[0] ?? 0,
  };
});

// Mock next/image — render a plain img
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: Record<string, unknown>) => (
    <img src={src as string} alt={alt as string} {...props} />
  ),
}));

// Mock next/link — render a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children}</a>
  ),
}));

describe('HomeSections', () => {
  it('renders all four chapters (Work, Process, Philosophy, Contact)', () => {
    const { container } = render(<HomeSections />);
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(4);

    expect(container.querySelector('#work')).toBeTruthy();
    expect(container.querySelector('#method')).toBeTruthy();
    expect(container.querySelector('#philosophy')).toBeTruthy();
    expect(container.querySelector('#contact')).toBeTruthy();
  });

  it('renders four work items in the selected-work grid', () => {
    const { container } = render(<HomeSections />);
    const workSection = container.querySelector('#work');
    expect(workSection).toBeTruthy();

    const headings = workSection?.querySelectorAll('h3') ?? [];
    expect(headings).toHaveLength(4);

    const titles = Array.from(headings).map((h) => h.textContent);
    expect(titles).toContain('Obsidian Villa');
    expect(titles).toContain('Lumina Pavilion');
    expect(titles).toContain('Azure Heights');
    expect(titles).toContain('Kaze Sanctuary');
  });

  it('renders the three-step process', () => {
    const { container } = render(<HomeSections />);
    const processSection = container.querySelector('#method');
    expect(processSection).toBeTruthy();

    const steps = processSection?.querySelectorAll('h3') ?? [];
    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toBe('Observe');
    expect(steps[1].textContent).toBe('Synthesize');
    expect(steps[2].textContent).toBe('Render');
  });

  it('renders philosophy principles', () => {
    const { container } = render(<HomeSections />);
    const philosophySection = container.querySelector('#philosophy');
    expect(philosophySection).toBeTruthy();

    const principles = philosophySection?.querySelectorAll('p') ?? [];
    expect(principles.length).toBeGreaterThan(0);
  });

  it('renders contact CTA with link to /contact', () => {
    const { container } = render(<HomeSections />);
    const contactSection = container.querySelector('#contact');
    expect(contactSection).toBeTruthy();

    const link = contactSection?.querySelector('a[href="/contact"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Start a project');
  });
});