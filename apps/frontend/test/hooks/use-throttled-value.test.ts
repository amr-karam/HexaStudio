import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottledValue, useThrottledCallback } from '@/hooks/useThrottledValue';

describe('useThrottledValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useThrottledValue('a', 200));
    expect(result.current).toBe('a');
  });

  it('throttles rapid changes – leading + trailing', () => {
    const { result, rerender } = renderHook(({ v }) => useThrottledValue(v, 200), {
      initialProps: { v: 'a' },
    });
    // second value inside window → not committed yet (leading was 'a')
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    rerender({ v: 'c' });
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');
  });

  it('allows next value after window elapsed', () => {
    const { result, rerender } = renderHook(({ v }) => useThrottledValue(v, 100), {
      initialProps: { v: 'a' },
    });
    act(() => vi.advanceTimersByTime(110));
    rerender({ v: 'b' });
    expect(result.current).toBe('b');
  });
});

describe('useThrottledCallback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires leading edge immediately', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(cb, 200));
    act(() => result.current('x'));
    expect(cb).toHaveBeenCalledWith('x');
  });

  it('throttles and fires trailing with latest args', () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(cb, 200));
    act(() => result.current('a')); // leading
    expect(cb).toHaveBeenCalledTimes(1);
    act(() => result.current('b'));
    act(() => result.current('c'));
    expect(cb).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(200));
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenLastCalledWith('c');
  });

  it('uses latest callback ref', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useThrottledCallback(cb, 200), {
      initialProps: { cb: cb1 },
    });
    rerender({ cb: cb2 });
    act(() => vi.advanceTimersByTime(250)); // clear window
    act(() => result.current('z'));
    expect(cb2).toHaveBeenCalledWith('z');
    expect(cb1).not.toHaveBeenCalledWith('z');
  });
});
