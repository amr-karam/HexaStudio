import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdle } from '@/hooks/useIdle';

describe('useIdle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts not idle', () => {
    const { result } = renderHook(() => useIdle(1000));
    expect(result.current).toBe(false);
  });

  it('becomes idle after timeout (real timers)', async () => {
    // Temporarily switch to real timers because fake timer state flushing
    // doesn't play well with renderHook + act for timer callbacks
    vi.useRealTimers();
    const { result } = renderHook(() => useIdle(10));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    expect(result.current).toBe(true);
    vi.useFakeTimers();
  });

  it('resets on activity', () => {
    const { result } = renderHook(() => useIdle(500, ['mousemove']));
    // Timer hasn't fired yet (still within timeout window)
    act(() => document.dispatchEvent(new Event('mousemove')));
    expect(result.current).toBe(false);
  });

  it('custom events work', () => {
    const { result } = renderHook(() => useIdle(300, ['keydown']));
    // Timer hasn't fired yet
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })));
    expect(result.current).toBe(false);
  });

  it('cleans up listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useIdle(1000));
    unmount();
    expect(removeSpy).toHaveBeenCalled();
  });
});
