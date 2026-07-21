import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import CursorTrail from '@/components/effects/CursorTrail';

// Mock useMotionPolicy
vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: vi.fn(() => ({
    animationsEnabled: true,
    finePointer: true,
    reducedMotion: false,
    paused: false,
    staticMode: false,
    togglePause: vi.fn(),
    setPaused: vi.fn(),
  })),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  useMotionValue: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

describe('CursorTrail', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame / cancelAnimationFrame
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => clearTimeout(id)));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders a canvas on fine pointer with animations enabled', () => {
    const { container } = render(<CursorTrail />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('does not render a canvas on coarse pointer', async () => {
    const { useMotionPolicy } = await import('@/hooks/useMotionPolicy');
    vi.mocked(useMotionPolicy).mockReturnValue({
      animationsEnabled: true,
      finePointer: false,
      reducedMotion: false,
      paused: false,
      staticMode: false,
      togglePause: vi.fn(),
      setPaused: vi.fn(),
    });

    const { container } = render(<CursorTrail />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeInTheDocument();
  });

  it('does not render a canvas when animations are disabled', async () => {
    const { useMotionPolicy } = await import('@/hooks/useMotionPolicy');
    vi.mocked(useMotionPolicy).mockReturnValue({
      animationsEnabled: false,
      finePointer: true,
      reducedMotion: true,
      paused: false,
      staticMode: true,
      togglePause: vi.fn(),
      setPaused: vi.fn(),
    });

    const { container } = render(<CursorTrail />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeInTheDocument();
  });
});
