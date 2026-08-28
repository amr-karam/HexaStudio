import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResizeObserver } from '@/hooks/useResizeObserver';

describe('useResizeObserver', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let mockCallback: ((entries: globalThis.ResizeObserverEntry[]) => void) | null;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    // Mock ResizeObserver constructor
    mockCallback = null;
    globalThis.ResizeObserver = class MockResizeObserver {
      constructor(callback: (entries: globalThis.ResizeObserverEntry[]) => void) {
        mockCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
    } as unknown as typeof globalThis.ResizeObserver;
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>)['ResizeObserver'];
  });

  it('returns 0 width/height before observing', () => {
    const { result } = renderHook(() => useResizeObserver());
    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
    expect(result.current.entry).toBeNull();
  });

  it('observes element via ref callback and reports size', async () => {
    const { result } = renderHook(() => useResizeObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    // Wait for effect to run
    await act(() => {});

    expect(mockObserve).toHaveBeenCalledWith(div, expect.objectContaining({ box: 'content-box' }));
    expect(result.current.width).toBe(0); // no entry yet

    // Simulate a resize callback
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

  it('can observe an explicit element', async () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element }));
    await act(() => {});
    expect(mockObserve).toHaveBeenCalledWith(element, expect.objectContaining({ box: 'content-box' }));
    expect(result.current.width).toBe(0);
  });

  it('can use target as RefObject', async () => {
    const element = document.createElement('div');
    const refObj = { current: element };
    const { result } = renderHook(() =>
      useResizeObserver({ target: refObj as React.RefObject<Element | null> }),
    );
    await act(() => {});
    expect(mockObserve).toHaveBeenCalledWith(element, expect.anything());
    expect(result.current.width).toBe(0);
  });

  it('disabled does not observe', async () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element, enabled: false }));
    await act(() => {});
    expect(mockObserve).not.toHaveBeenCalled();
    expect(result.current.width).toBe(0);
  });

  it('allows custom box model', async () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element, box: 'border-box' }));
    await act(() => {});
    expect(mockObserve).toHaveBeenCalledWith(element, expect.objectContaining({ box: 'border-box' }));
  });

  it('cleans up observer on unmount', async () => {
    const element = document.createElement('div');
    const { unmount } = renderHook(() => useResizeObserver({ target: element }));
    await act(() => {});
    expect(mockDisconnect).not.toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('ref callback does not trigger observation when explicit target given', async () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useResizeObserver({ target: element }));
    await act(() => {});
    // Call ref with a different element - observe should still only be called once
    act(() => {
      result.current.ref(document.createElement('span'));
    });
    expect(mockObserve).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(element, expect.anything());
  });

  it('disconnect is called when target changes', async () => {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    const { rerender } = renderHook(
      ({ target }) => useResizeObserver({ target }),
      { initialProps: { target: element1 } },
    );
    await act(() => {});
    expect(mockObserve).toHaveBeenCalledWith(element1, expect.anything());
    expect(mockDisconnect).not.toHaveBeenCalled();

    rerender({ target: element2 });
    await act(() => {});
    expect(mockObserve).toHaveBeenCalledWith(element2, expect.anything());
    expect(mockDisconnect).toHaveBeenCalled(); // should disconnect old observer
  });
});
