import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageVisibility } from '@/hooks/usePageVisibility';

describe('usePageVisibility', () => {
  const originalVisibility = document.visibilityState;

  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      value: originalVisibility,
      writable: true,
      configurable: true,
    });
  });

  it('returns true when visible', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  it('returns false when hidden', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(false);
  });

  it('updates on visibilitychange event', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current).toBe(false);

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => usePageVisibility());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function), { passive: true });
  });

  it('handles server-side rendering (document undefined)', () => {
    // Simulate SSR initial state
    const originalDocument = global.document;
    // @ts-expect-error simulating SSR
    delete (global as unknown as { document?: Document }).document;
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
    // Restore
    global.document = originalDocument;
  });
});
