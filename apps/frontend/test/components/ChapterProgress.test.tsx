import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChapterProgress, type Chapter } from '@/components/animation/ChapterProgress';

const hoisted = vi.hoisted(() => ({
  policy: { finePointer: true, reducedMotion: false },
}));

vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => hoisted.policy,
}));

const CHAPTERS: Chapter[] = [
  { id: 'ch-vision', label: 'Vision' },
  { id: 'ch-craft', label: 'Craft' },
  { id: 'ch-method', label: 'Method' },
];

describe('ChapterProgress', () => {
  let observed: Element[];
  let disconnectCount: number;

  beforeEach(() => {
    hoisted.policy = { finePointer: true, reducedMotion: false };
    observed = [];
    disconnectCount = 0;

    class MockIO implements IntersectionObserver {
      root = null;
      rootMargin = '';
      thresholds = [0];
      constructor(_cb: IntersectionObserverCallback) {
        void _cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {
        disconnectCount += 1;
      }
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', MockIO);

    // Provide DOM sections to observe + scroll target
    CHAPTERS.forEach((c) => {
      const section = document.createElement('section');
      section.id = c.id;
      section.scrollIntoView = vi.fn();
      document.body.appendChild(section);
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders a navigation landmark with the given label', () => {
    render(<ChapterProgress chapters={CHAPTERS} ariaLabel="Case study chapters" />);
    expect(
      screen.getByRole('navigation', { name: 'Case study chapters' }),
    ).toBeInTheDocument();
  });

  it('renders one button per chapter', () => {
    render(<ChapterProgress chapters={CHAPTERS} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marks the first chapter active by default', () => {
    render(<ChapterProgress chapters={CHAPTERS} />);
    const first = screen.getByRole('button', { name: '01 — Vision' });
    expect(first).toHaveAttribute('aria-current', 'true');
  });

  it('scrolls to a chapter when its dot is clicked', () => {
    render(<ChapterProgress chapters={CHAPTERS} />);
    const second = screen.getByRole('button', { name: '02 — Craft' });
    fireEvent.click(second);
    const target = document.getElementById('ch-craft');
    expect(target?.scrollIntoView).toHaveBeenCalled();
  });

  it('observes every section and disconnects on unmount', () => {
    const { unmount } = render(<ChapterProgress chapters={CHAPTERS} />);
    expect(observed).toHaveLength(3);
    unmount();
    expect(disconnectCount).toBeGreaterThan(0);
  });

  it('renders nothing on coarse pointer devices', () => {
    hoisted.policy = { finePointer: false, reducedMotion: false };
    const { container } = render(<ChapterProgress chapters={CHAPTERS} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are no chapters', () => {
    const { container } = render(<ChapterProgress chapters={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
