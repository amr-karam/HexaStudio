import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { SmoothScroll } from '@/components/SmoothScroll';

const hoisted = vi.hoisted(() => ({
  lenisConstructed: { count: 0 },
  reducedMotion: { value: false },
  paused: { value: false },
  finePointer: { value: true },
}));

vi.mock('lenis', () => ({
  default: class {
    raf = vi.fn();
    destroy = vi.fn();
    on = vi.fn();
    constructor() {
      hoisted.lenisConstructed.count++;
    }
  },
}));

vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({
    staticMode: hoisted.reducedMotion.value || hoisted.paused.value,
    finePointer: hoisted.finePointer.value,
    animationsEnabled: !hoisted.reducedMotion.value && !hoisted.paused.value,
    reducedMotion: hoisted.reducedMotion.value,
    paused: hoisted.paused.value,
    togglePause: vi.fn(),
    setPaused: vi.fn(),
  }),
}));

describe('SmoothScroll', () => {
  beforeEach(() => {
    hoisted.lenisConstructed.count = 0;
    hoisted.reducedMotion.value = false;
    hoisted.paused.value = false;
    hoisted.finePointer.value = true;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
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

  it('does not initialize Lenis when paused', () => {
    hoisted.paused.value = true;
    render(
      <SmoothScroll>
        <p>Scroll content</p>
      </SmoothScroll>,
    );
    expect(hoisted.lenisConstructed.count).toBe(0);
  });

  it('initializes Lenis when animations are enabled', () => {
    hoisted.reducedMotion.value = false;
    hoisted.paused.value = false;
    render(
      <SmoothScroll>
        <p>Scroll content</p>
      </SmoothScroll>,
    );
    expect(hoisted.lenisConstructed.count).toBe(1);
  });
});
