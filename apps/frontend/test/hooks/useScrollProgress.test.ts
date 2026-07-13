import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

describe('useScrollProgress', () => {
  let scrollListeners: (() => void)[];

  beforeEach(() => {
    scrollListeners = [];
    window.scrollY = 0;

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      value: 2000,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 1000,
    });

    window.addEventListener = vi.fn((event: string, handler: () => void) => {
      if (event === 'scroll') scrollListeners.push(handler);
    }) as unknown as typeof window.addEventListener;

    window.removeEventListener = vi.fn((event: string, handler: () => void) => {
      if (event === 'scroll') {
        scrollListeners = scrollListeners.filter((l) => l !== handler);
      }
    }) as unknown as typeof window.removeEventListener;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 initially when at top of page', () => {
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('returns progress value when scrolled', () => {
    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 500 });
      scrollListeners.forEach((fn) => fn());
    });

    expect(result.current).toBe(0.5);
  });

  it('clamps progress to 1 at bottom of page', () => {
    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 2000 });
      scrollListeners.forEach((fn) => fn());
    });

    expect(result.current).toBe(1);
  });

  it('returns 0 when page has no scrollable area', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      value: 1000, // same as innerHeight
    });

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('cleans up scroll listener on unmount', () => {
    const { unmount } = renderHook(() => useScrollProgress());
    expect(scrollListeners.length).toBe(1);
    unmount();
    expect(scrollListeners.length).toBe(0);
  });
});
