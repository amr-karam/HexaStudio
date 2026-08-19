import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/**
 * Module-level variable to store the captured IntersectionObserver callback
 * so individual tests can trigger intersection changes.
 */
let capturedCallback: IntersectionObserverCallback | null = null;
let observeSpy: ((target: Element) => void) | null = null;
let unobserveSpy: ((target: Element) => void) | null = null;

/**
 * A minimal mock IntersectionObserver class that captures the callback
 * and delegates observe/unobserve/disconnect to spies so tests can assert.
 */
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [0];

  constructor(callback: IntersectionObserverCallback) {
    capturedCallback = callback;
  }

  observe = ((target: Element): void => {
    observeSpy?.(target);
  }) as IntersectionObserver['observe'];

  unobserve = ((target: Element): void => {
    unobserveSpy?.(target);
  }) as IntersectionObserver['unobserve'];

  disconnect = (() => {
    // no-op
  }) as IntersectionObserver['disconnect'];

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Helper: triggers the captured callback with synthetic entries. */
function trigger(entries: Partial<IntersectionObserverEntry>[]): void {
  if (!capturedCallback) return;
  const fullEntries = entries.map((e) => ({
    time: 0,
    target: {} as Element,
    boundingClientRect: {} as DOMRectReadOnly,
    rootBounds: null,
    intersectionRect: {} as DOMRectReadOnly,
    isIntersecting: false,
    intersectionRatio: 0,
    ...e,
  })) as IntersectionObserverEntry[];
  capturedCallback(fullEntries, {} as IntersectionObserver);
}

describe('useIntersectionObserver', () => {
  const originalIO = window.IntersectionObserver;

  afterEach(() => {
    // Restore state for the next test.
    capturedCallback = null;
    observeSpy = null;
    unobserveSpy = null;
  });

  beforeEach(() => {
    // Install the mock IntersectionObserver on window.
    Object.defineProperty(window, 'IntersectionObserver', {
      value: MockIntersectionObserver,
      configurable: true,
      writable: true,
    });
  });

  afterAll(() => {
    // Restore the original IntersectionObserver.
    Object.defineProperty(window, 'IntersectionObserver', {
      value: originalIO,
      configurable: true,
      writable: true,
    });
  });

  it('returns false isIntersecting initially', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it('attaches an observer when a node is provided', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    expect(capturedCallback).not.toBeNull();
  });

  it('updates isIntersecting when the callback fires', () => {
    const { result } = renderHook(() => useIntersectionObserver({ once: false }));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    expect(result.current.isIntersecting).toBe(false);

    act(() => {
      trigger([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.intersectionRatio).toBe(0.5);
  });

  it('sets isIntersecting based on intersectionRatio and isIntersecting', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    act(() => {
      trigger([{ isIntersecting: true, intersectionRatio: 0 }]);
    });
    // ratio is 0, so isVisible is false but isIntersecting is true.
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.isVisible).toBe(false);

    act(() => {
      trigger([{ isIntersecting: true, intersectionRatio: 0.8 }]);
    });
    expect(result.current.entry?.isVisible).toBe(true);
  });

  it('unsubscribes after first intersection when once is true', () => {
    const unobserve = vi.fn();
    unobserveSpy = unobserve; // injected into MockIO constructor

    const { result } = renderHook(() => useIntersectionObserver({ once: true }));
    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    act(() => {
      trigger([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    expect(unobserve).toHaveBeenCalled();
  });

  it('clears the entry when node is null', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.entry).toBeNull();
  });
});
