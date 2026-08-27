import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInterval, useTimeout } from '@/hooks/useInterval';

describe('useInterval', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls callback on interval', () => {
    const cb = vi.fn();
    renderHook(() => useInterval(cb, 100));
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('pauses when delay is null', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(({ d }) => useInterval(cb, d), { initialProps: { d: 100 as number | null } });
    vi.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);
    rerender({ d: null });
    vi.advanceTimersByTime(300);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('uses latest callback', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const { rerender } = renderHook(({ cb }) => useInterval(cb, 100), { initialProps: { cb: cb1 } });
    rerender({ cb: cb2 });
    vi.advanceTimersByTime(100);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => useInterval(cb, 100));
    unmount();
    vi.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('useTimeout', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires once after delay', () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, 200));
    vi.advanceTimersByTime(199);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not fire when delay is null', () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, null));
    vi.advanceTimersByTime(1000);
    expect(cb).not.toHaveBeenCalled();
  });

  it('resets timer when delay changes', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(({ d }) => useTimeout(cb, d), { initialProps: { d: 200 as number | null } });
    vi.advanceTimersByTime(100);
    rerender({ d: 400 });
    vi.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
