import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// The test setup.ts file polyfills IntersectionObserver with a minimal
// mock. We override it here with a more controllable mock.

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.options = options;
  }

  observe(target: Element) {
    this.elements.push(target);
  }

  unobserve(target: Element) {
    this.elements = this.elements.filter((el) => el !== target);
  }

  disconnect() {
    this.elements = [];
  }

  // Method to simulate an intersection change.
  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    const fullEntries = entries.map((entry, i) => ({
      time: 0,
      target: this.elements[i] ?? entry.target!,
      ...entry,
    })) as IntersectionObserverEntry[];
    this.callback(fullEntries, this as unknown as IntersectionObserver);
  }

  takeRecords() {
    return [];
  }

  root = null;
  rootMargin = '0px';
  thresholds = [0];
}

describe('useIntersectionObserver', () => {
  let mockObserver: MockIntersectionObserver;

  beforeEach(() => {
    mockObserver = new MockIntersectionObserver(() => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        mockObserver = new MockIntersectionObserver(callback, options);
        // Store a reference so tests can trigger callbacks.
        (window as any)._currentObserver = mockObserver;
      }
      observe(target: Element) { mockObserver.observe(target); }
      unobserve(target: Element) { mockObserver.unobserve(target); }
      disconnect() { mockObserver.disconnect(); }
      takeRecords() { return []; }
    };
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any)._currentObserver;
  });

  it('returns false isIntersecting initially', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.isIntersecting).toBe(false);
  });

  it('attaches an observer when a node is provided', () => {
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    };

    const { result } = renderHook(() => useIntersectionObserver());

    // Assign a mocked node via the ref callback.
    act(() => {
      result.current.ref({
        getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect,
      } as HTMLDivElement);
    });

    expect(observeSpy).toHaveBeenCalled();
  });

  it('updates isIntersecting when the callback fires', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let triggerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        triggerCallback = (entries: Partial<IntersectionObserverEntry>[]) => {
          callback(
            entries.map(
              (e) =>
                ({
                  time: 0,
                  target: {} as Element,
                  boundingClientRect: {} as DOMRectReadOnly,
                  rootBounds: null,
                  intersectionRect: {} as DOMRectReadOnly,
                  isIntersecting: false,
                  intersectionRatio: 0,
                  ...e,
                }) as IntersectionObserverEntry,
            ),
            this as unknown as IntersectionObserver,
          );
        };
      }
    };

    const { result } = renderHook(() => useIntersectionObserver({ once: false }));

    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    expect(result.current.isIntersecting).toBe(false);

    // Simulate the element coming into view.
    act(() => {
      triggerCallback!([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.intersectionRatio).toBe(0.5);
  });

  it('sets isIntersecting based on intersectionRatio and isIntersecting', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let triggerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        triggerCallback = (entries: Partial<IntersectionObserverEntry>[]) => {
          callback(
            entries.map(
              (e) =>
                ({
                  time: 0,
                  target: {} as Element,
                  boundingClientRect: {} as DOMRectReadOnly,
                  rootBounds: null,
                  intersectionRect: {} as DOMRectReadOnly,
                  isIntersecting: false,
                  intersectionRatio: 0,
                  ...e,
                }) as IntersectionObserverEntry,
            ),
            this as unknown as IntersectionObserver,
          );
        };
      }
    };

    const { result } = renderHook(() => useIntersectionObserver());
    const node = document.createElement('div');
    act(() => { result.current.ref(node); });

    act(() => { triggerCallback!([{ isIntersecting: true, intersectionRatio: 0 }]); });
    // ratio is 0, so isVisible is false but isIntersecting is true.
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry?.isVisible).toBe(false);

    act(() => { triggerCallback!([{ isIntersecting: true, intersectionRatio: 0.8 }]); });
    expect(result.current.entry?.isVisible).toBe(true);
  });

  it('unsubscribes after first intersection when once is true', () => {
    const unobserveSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let triggerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = unobserveSpy;
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        triggerCallback = (entries: Partial<IntersectionObserverEntry>[]) => {
          callback(
            entries.map(
              (e) =>
                ({
                  time: 0,
                  target: {} as Element,
                  boundingClientRect: {} as DOMRectReadOnly,
                  rootBounds: null,
                  intersectionRect: {} as DOMRectReadOnly,
                  isIntersecting: false,
                  intersectionRatio: 0,
                  ...e,
                }) as IntersectionObserverEntry,
            ),
            this as unknown as IntersectionObserver,
          );
        };
      }
    };

    const { result } = renderHook(() => useIntersectionObserver({ once: true }));
    const node = document.createElement('div');
    act(() => { result.current.ref(node); });

    act(() => { triggerCallback!([{ isIntersecting: true, intersectionRatio: 1 }]); });
    expect(unobserveSpy).toHaveBeenCalled();
  });

  it('clears the entry when node is null (unmount)', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();
  });
});
