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
  const createMotionComponent = (tag: string) => {
    const Component = ({ children, ...props }: Record<string, unknown>) => {
      const Tag = tag as keyof JSX.IntrinsicElements;
      // @ts-expect-error passthrough renderer for tests
      return <Tag {...filterProps(props)}>{children}</Tag>;
    };
    return Component;
  };
  return {
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      section: createMotionComponent('section'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      p: createMotionComponent('p'),
      a: createMotionComponent('a'),
      img: createMotionComponent('img'),
    },
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: (_: unknown, __: unknown, range: number[]) => range[0] ?? 0,
    useInView: () => true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
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

// Mock Button — render a plain button
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('HomeSections', () => {
  it('renders all chapters', () => {
    const { container } = render(<HomeSections />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(3);

    expect(container.querySelector('#craft')).toBeTruthy();
    expect(container.querySelector('#process')).toBeTruthy();
    expect(container.querySelector('#impact')).toBeTruthy();
  });

  it('renders craft chapter content', () => {
    const { container } = render(<HomeSections />);
    const section = container.querySelector('#craft');
    expect(section).toBeTruthy();

    const heading = section?.querySelector('h2');
    expect(heading?.textContent).toBe('Rendered, not built.');
  });

  it('renders process steps', () => {
    const { container } = render(<HomeSections />);
    const section = container.querySelector('#process');
    expect(section).toBeTruthy();

    const cards = section?.querySelectorAll('p.font-light') ?? [];
    expect(cards.length).toBeGreaterThanOrEqual(5);

    const labels = Array.from(cards).map((p) => p.textContent);
    expect(labels).toContain('Spatial Brief');
    expect(labels).toContain('Massing Study');
    expect(labels).toContain('Scene Authoring');
  });

  it('renders impact contact CTA', () => {
    const { container } = render(<HomeSections />);
    const section = container.querySelector('#impact');
    expect(section).toBeTruthy();

    const link = section?.querySelector('a[href="/contact"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Begin a project');
  });
});