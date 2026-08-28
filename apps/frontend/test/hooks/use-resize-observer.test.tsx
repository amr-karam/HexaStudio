import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useResizeObserver } from '@/hooks/useResizeObserver';

describe('useResizeObserver', () => {
  const mockContentRect = {
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    top: 0,
    right: 300,
    bottom: 200,
    left: 0,
    toJSON() { return this; },
  };

  it('returns 0 width/height before observing', () => {
    const { result } = renderHook(() => useResizeObserver());
    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
    expect(result.current.entry).toBeNull();
  });

  it('observes element via ref callback', () => {
    const observerSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: observerSpy, disconnect: vi.fn() })) as unknown as typeof globalThis.ResizeObserver;

    const { result } = renderHook(() => useResizeObserver());
    // Before attaching ref, nothing observed
    expect(result.current.width).toBe(0);

    // Attach ref
    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    const observer = (globalThis.ResizeObserver as unknown as { new(fn: (entries: unknown[]) => void): unknown }).prototype;
    expect(observerSpy).toHaveBeenCalled();
    // Trigger a resize entry
    const entries = [{ contentRect: mockContentRect, target: div }];
    // The observer callback should be called — but we need to call it directly
    const observerInstance = globalThis.ResizeObserver;
    if (observerInstance instanceof Function) {
      const constructed = new (observerInstance as { new(fn: (entries: globalThis.ResizeObserverEntry[]) => void): unknown })((entries) => {
        // This is the callback; we already spied on observe
      });
    }
    globalThis.ResizeObserver = undefined as unknown as typeof globalThis.ResizeObserver;
  });

  it('can observe an explicit element', () => {
    const element = document.createElement('div');
    const observerSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: observerSpy, disconnect: vi.fn() })) as unknown as typeof globalThis.ResizeObserver;

    const { result } = renderHook(() => useResizeObserver({ target: element }));
    expect(observerSpy).toHaveBeenCalledWith(element, expect.objectContaining({ box: 'content-box' }));
  });

  it('can use target as RefObject', () => {
    const element = document.createElement('div');
    const refObj = { current: element };
    const observerSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: observerSpy, disconnect: vi.fn() })) as unknown as typeof globalThis.ResizeObserver;

    const { result } = renderHook(() => useResizeObserver({ target: refObj }));
    expect(observerSpy).toHaveBeenCalledWith(element, expect.anything());
  });

  it('disabled does not observe', () => {
    const element = document.createElement('div');
    const observerSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: observerSpy, disconnect: vi.fn() })) as unknown as typeof globalThis.ResizeObserver;

    const { result } = renderHook(() => useResizeObserver({ target: element, enabled: false }));
    expect(observerSpy).not.toHaveBeenCalled();
    expect(result.current.width).toBe(0);
  });

  it('allows custom box model', () => {
    const element = document.createElement('div');
    const observerSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: observerSpy, disconnect: vi.fn() })) as unknown as typeof globalThis.ResizeObserver;

    const { result } = renderHook(() => useResizeObserver({ target: element, box: 'border-box' }));
    expect(observerSpy).toHaveBeenCalledWith(element, expect.objectContaining({ box: 'border-box' }));
  });

  it('cleans up observer on unmount', () => {
    const element = document.createElement('div');
    const disconnectSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: vi.fn(), disconnect: disconnectSpy })) as unknown as typeof globalThis.ResizeObserver;

    const { unmount } = renderHook(() => useResizeObserver({ target: element }));
    expect(disconnectSpy).not.toHaveBeenCalled();
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('ignores ref callback when explicit target given', () => {
    const observerSpy = vi.fn();
    globalThis.ResizeObserver = vi.fn(() => ({ observe: observerSpy, disconnect: vi.fn() })) as unknown as typeof globalThis.ResizeObserver;

    const { result } = renderHook(() => useResizeObserver({ target: document.createElement('div') }));
    // Ref should still be callable (for JSX)
    result.current.ref(document.createElement('span'));
    // But observerSpy should only be called once (for the explicit target)
    expect(observerSpy).toHaveBeenCalledTimes(1);
  });
});
