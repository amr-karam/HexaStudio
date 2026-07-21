import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFinePointer } from '@/hooks/useFinePointer';

describe('useFinePointer', () => {
  let matchMediaSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const listeners: Record<string, Array<(e: MediaQueryListEvent) => void>> = {};

    matchMediaSpy = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(pointer: fine)' ? true : false,
      media: query,
      onchange: null,
      addEventListener: (event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (!listeners[query]) listeners[query] = [];
        listeners[query].push(cb);
      },
      removeEventListener: (event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (listeners[query]) {
          listeners[query] = listeners[query].filter((fn) => fn !== cb);
        }
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    vi.stubGlobal('matchMedia', matchMediaSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when device has a fine pointer', () => {
    matchMediaSpy.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    const { result } = renderHook(() => useFinePointer());
    expect(result.current).toBe(true);
  });

  it('returns false when device has a coarse pointer', () => {
    matchMediaSpy.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    const { result } = renderHook(() => useFinePointer());
    expect(result.current).toBe(false);
  });

  it('updates when pointer capability changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    matchMediaSpy.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        changeHandler = cb;
      },
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));

    const { result } = renderHook(() => useFinePointer());
    expect(result.current).toBe(true);

    // Simulate pointer capability change to coarse
    act(() => {
      changeHandler?.({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });
});
