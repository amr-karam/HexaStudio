import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

describe('useMotionPolicy', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();

    // Default matchMedia: no reduced motion, fine pointer
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => {
        let matches = false;
        if (query === '(prefers-reduced-motion: reduce)') matches = false;
        if (query === '(pointer: fine)') matches = true;
        return {
          matches,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns default policy state', () => {
    const { result } = renderHook(() => useMotionPolicy());
    expect(result.current.reducedMotion).toBe(false);
    expect(result.current.paused).toBe(false);
    expect(result.current.finePointer).toBe(true);
    expect(result.current.animationsEnabled).toBe(true);
    expect(result.current.staticMode).toBe(false);
  });

  it('toggles pause state', () => {
    const { result } = renderHook(() => useMotionPolicy());

    expect(result.current.paused).toBe(false);
    expect(result.current.animationsEnabled).toBe(true);

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.paused).toBe(true);
    expect(result.current.animationsEnabled).toBe(false);
    expect(result.current.staticMode).toBe(true);
  });

  it('persists pause to localStorage', () => {
    const { result } = renderHook(() => useMotionPolicy());

    act(() => {
      result.current.togglePause();
    });

    expect(localStorage.getItem('hexa:animations-paused')).toBe('true');

    act(() => {
      result.current.togglePause();
    });

    expect(localStorage.getItem('hexa:animations-paused')).toBe('false');
  });

  it('reads initial pause from localStorage', () => {
    localStorage.setItem('hexa:animations-paused', 'true');

    const { result } = renderHook(() => useMotionPolicy());
    expect(result.current.paused).toBe(true);
    expect(result.current.staticMode).toBe(true);
  });

  it('composes reducedMotion + pause correctly', () => {
    // Set up reduced motion
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    const { result } = renderHook(() => useMotionPolicy());
    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.staticMode).toBe(true);
    expect(result.current.animationsEnabled).toBe(false);
  });

  it('setPaused works explicitly', () => {
    const { result } = renderHook(() => useMotionPolicy());

    act(() => {
      result.current.setPaused(true);
    });
    expect(result.current.paused).toBe(true);

    act(() => {
      result.current.setPaused(false);
    });
    expect(result.current.paused).toBe(false);
  });
});
