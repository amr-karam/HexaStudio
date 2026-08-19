import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowSize, useWindowBreakpoint } from '@/hooks/useWindowSize';

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    // Clean up matchMedia mock if set.
    vi.restoreAllMocks();
  });

  it('returns the current window dimensions on initial render', () => {
    window.innerWidth = 1024;
    window.innerHeight = 768;

    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 1024, height: 768 });
  });

  it('updates when the window is resized', () => {
    window.innerWidth = 800;
    window.innerHeight = 600;

    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 800, height: 600 });

    act(() => {
      window.innerWidth = 1200;
      window.innerHeight = 900;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toEqual({ width: 1200, height: 900 });
  });

  it('uses the delay option to throttle updates', () => {
    vi.useFakeTimers();

    window.innerWidth = 500;
    window.innerHeight = 400;

    const { result } = renderHook(() => useWindowSize(100));

    expect(result.current).toEqual({ width: 500, height: 400 });

    act(() => {
      window.innerWidth = 600;
      window.dispatchEvent(new Event('resize'));
    });

    // Should not update immediately due to throttling.
    expect(result.current).toEqual({ width: 500, height: 400 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ width: 600, height: 400 });

    vi.useRealTimers();
  });

  it('cleanly adds and removes event listeners on mount/unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWindowSize());

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});

describe('useWindowBreakpoint', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
  });

  it('returns the mobile breakpoint for small screens', () => {
    window.innerWidth = 500;
    window.innerHeight = 800;

    const { result } = renderHook(() => useWindowBreakpoint());
    expect(result.current.breakpoint).toBe('mobile');
  });

  it('returns the tablet breakpoint for medium screens', () => {
    window.innerWidth = 800;
    window.innerHeight = 600;

    const { result } = renderHook(() => useWindowBreakpoint());
    expect(result.current.breakpoint).toBe('tablet');
  });

  it('returns the desktop breakpoint for large screens', () => {
    window.innerWidth = 1100;
    window.innerHeight = 800;

    const { result } = renderHook(() => useWindowBreakpoint());
    expect(result.current.breakpoint).toBe('desktop');
  });

  it('returns the largeDesktop breakpoint for very large screens', () => {
    window.innerWidth = 1500;
    window.innerHeight = 900;

    const { result } = renderHook(() => useWindowBreakpoint());
    expect(result.current.breakpoint).toBe('largeDesktop');
  });

  it('includes width, height, and breakpoint in the result', () => {
    window.innerWidth = 1024;
    window.innerHeight = 768;

    const { result } = renderHook(() => useWindowBreakpoint());
    expect(result.current).toHaveProperty('width', 1024);
    expect(result.current).toHaveProperty('height', 768);
    expect(result.current).toHaveProperty('breakpoint', 'desktop');
  });
});
