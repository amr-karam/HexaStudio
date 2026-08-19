import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue, useDebouncedCallback } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates by the specified delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    });
    expect(result.current).toBe('first');

    rerender({ value: 'second' });
    // Not updated yet — still reflects the old value.
    expect(result.current).toBe('first');

    // Advance timers past the debounce window.
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('second');
  });

  it('resets the timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: 'c' });
    // Timer was reset, so advancing 200ms is not enough.
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');
  });

  it('works with objects', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: { count: 0 } } },
    );
    expect(result.current).toEqual({ count: 0 });

    rerender({ value: { count: 5 } });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toEqual({ count: 5 });
  });

  it('works with arrays', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: [1, 2, 3] },
    });
    expect(result.current).toEqual([1, 2, 3]);

    rerender({ value: [4, 5, 6] });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toEqual([4, 5, 6]);
  });

  it('uses default delay of 300ms when not specified', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('b');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a function', () => {
    const { result } = renderHook(() => useDebouncedCallback(() => {}, 300));
    expect(typeof result.current).toBe('function');
  });

  it('invokes the callback after the delay', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => result.current('arg1'));

    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');
  });

  it('does not invoke the callback multiple times for rapid successive calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => result.current());
    act(() => result.current());
    act(() => result.current());

    // Not called yet.
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    // Only called once — the timer was reset on each call.
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses the latest callback reference', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 200), {
      initialProps: { cb: callback1 },
    });

    act(() => result.current());
    rerender({ cb: callback2 });

    act(() => vi.advanceTimersByTime(200));
    // The latest callback (callback2) should be invoked.
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).not.toHaveBeenCalled();
  });

  it('returns a stable function reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useDebouncedCallback(() => {}, 300));

    const firstRef = result.current;
    rerender();
    const secondRef = result.current;

    // The debounced function is memoised — its identity should not change
    // unless the delay changes.
    expect(secondRef).toBe(firstRef);
  });
});
