import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResizeObserver } from '@/hooks/useResizeObserver';

// Proper mock of ResizeObserver constructor
let mockCallback: ((entries: globalThis.ResizeObserverEntry[]) => void) | null = null;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockUnobserve = vi.fn();

function setupResizeObserverMock() {
  
  globalThis.ResizeObserver = class MockResizeObserver {
    constructor(callback: (entries: globalThis.ResizeObserverEntry[]) => void) {
      mockCallback = callback;
    }
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = mockUnobserve;
  } as unknown as typeof globalThis.ResizeObserver;
}

describe('useResizeObserver', () => {
  beforeEach(() => {
    setupResizeObserverMock();
  });

  it('returns 0 width/height before observing', () => {
    const { result } = renderHook(() => useResizeObserver());
    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
    expect(result.current.entry).toBeNull();
  });

  it('observes element via ref callback and reports size', () => {
    const { result } = renderHook(() => useResizeObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    expect(mockObserve).toHaveBeenCalledWith(div, expect.objectContaining({ box: 'content-box' }));
    expect(result.current.width).toBe(0); // no entry yet

    // Simulate a resize callback with a mock contentRect
    const mockEntry = {
      contentRect: {
        width: 100,
        height: 200,
        x: 0,
        y: 0,
        top: 0,
        right: 100,
        bottom: 200,
        left: 0,
        toJSON: () => ({}),
      } as DOMRectReadOnly,
      target: div,
    };
    act(() => {
      mockCallback?.([mockEntry as unknown as globalThis.ResizeObserverEntry]);
    });

    expect(result.current.width).toBe(100);
    expect(result.current.height).toBe(200);
    expect(result.current.entry).toEqual({
      width: 100,
      height: 200,
      x: 0,
      y: 0,
      contentRect: mockEntry.contentRect,
    });
  });

  it('can observe an explicit element', () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element }));
    expect(mockObserve).toHaveBeenCalledWith(element, expect.objectContaining({ box: 'content-box' }));
    expect(result.current.width).toBe(0);
  });

  it('can use target as RefObject', () => {
    const element = document.createElement('div');
    const refObj = { current: element };
    // Cast to RefObject<Element | null> for testing
    const { result } = renderHook(() =>
      useResizeObserver({ target: refObj as React.RefObject<Element | null> }),
    );
    expect(mockObserve).toHaveBeenCalledWith(element, expect.anything());
    expect(result.current.width).toBe(0);
  });

  it('disabled does not observe', () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element, enabled: false }));
    expect(mockObserve).not.toHaveBeenCalled();
    expect(result.current.width).toBe(0);
  });

  it('allows custom box model', () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element, box: 'border-box' }));
    expect(mockObserve).toHaveBeenCalledWith(element, expect.objectContaining({ box: 'border-box' }));
  });

  it('cleans up observer on unmount', () => {
    const element = document.createElement('div');
    const { unmount } = renderHook(() => useResizeObserver({ target: element }));
    expect(mockDisconnect).not.toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('ref callback does not trigger observation when explicit target given', () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element }));
    // Call ref with a different element - observe should still only be called once
    act(() => {
      result.current.ref(document.createElement('span'));
    });
    expect(mockObserve).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(element, expect.anything());
  });

  it('disconnect is called when target changes', () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const { rerender } = renderHook(
      ({ target }) => useResizeObserver({ target }),
      { initialProps: { target: element1 } },
    );
    expect(mockObserve).toHaveBeenCalledWith(element1, expect.anything());
    expect(mockDisconnect).not.toHaveBeenCalled();

    rerender({ target: element2 });
    expect(mockObserve).toHaveBeenCalledWith(element2, expect.anything());
    expect(mockDisconnect).toHaveBeenCalled(); // should disconnect old observer
  });
});
