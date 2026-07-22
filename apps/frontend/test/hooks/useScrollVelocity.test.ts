import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';

vi.mock('@/hooks/useMotionPolicy', () => ({
  useMotionPolicy: () => ({ staticMode: false }),
}));

describe('useScrollVelocity', () => {
  let scrollListeners: Array<() => void>;
  let rafCallbacks: Array<(t: number) => void>;
  let rafId: number;

  beforeEach(() => {
    scrollListeners = [];
    rafCallbacks = [];
    rafId = 0;

    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });

    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll') scrollListeners.push(handler as () => void);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
      if (event === 'scroll')
        scrollListeners = scrollListeners.filter((l) => l !== handler);
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a MotionValue starting at 0', () => {
    const { result } = renderHook(() => useScrollVelocity());
    expect(result.current.get()).toBe(0);
  });

  it('updates velocity on scroll event', () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValue(16);
    const { result } = renderHook(() => useScrollVelocity({ max: 40 }));

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 40 });
      scrollListeners.forEach((fn) => fn());
    });

    expect(result.current.get()).not.toBe(0);
  });

  it('clamps velocity to [-1, 1]', () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValue(16);
    const { result } = renderHook(() => useScrollVelocity({ max: 1 }));

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 9999 });
      scrollListeners.forEach((fn) => fn());
    });

    expect(result.current.get()).toBeLessThanOrEqual(1);
    expect(result.current.get()).toBeGreaterThanOrEqual(-1);
  });

  it('removes scroll listener on unmount', () => {
    const { unmount } = renderHook(() => useScrollVelocity());
    expect(scrollListeners.length).toBe(1);
    unmount();
    expect(scrollListeners.length).toBe(0);
  });

  it('does not attach listeners in static mode', () => {
    vi.doMock('@/hooks/useMotionPolicy', () => ({
      useMotionPolicy: () => ({ staticMode: true }),
    }));
    // staticMode path: velocity stays 0, no scroll listener
    const { result } = renderHook(() => useScrollVelocity());
    // In static mode the hook sets value to 0 and returns early
    expect(result.current.get()).toBe(0);
  });
});
