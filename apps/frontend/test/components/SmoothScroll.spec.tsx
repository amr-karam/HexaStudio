import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SmoothScroll } from '@/components/SmoothScroll';

const hoisted = vi.hoisted(() => ({
  lenisConstructed: { count: 0 },
  reducedMotion: { value: false },
}));

vi.mock('lenis', () => ({
  default: class {
    raf = vi.fn();
    destroy = vi.fn();
    constructor() {
      hoisted.lenisConstructed.count++;
    }
  },
}));

describe('SmoothScroll', () => {
  beforeEach(() => {
    hoisted.lenisConstructed.count = 0;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: hoisted.reducedMotion.value,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  it('renders its children', () => {
    hoisted.reducedMotion.value = false;
    render(
      <SmoothScroll>
        <p>Scroll content</p>
      </SmoothScroll>,
    );
    expect(screen.getByText('Scroll content')).toBeInTheDocument();
  });

  it('does not initialize Lenis when the user prefers reduced motion', () => {
    hoisted.reducedMotion.value = true;
    render(
      <SmoothScroll>
        <p>Scroll content</p>
      </SmoothScroll>,
    );
    expect(hoisted.lenisConstructed.count).toBe(0);
  });
});
