import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with initial seconds and autoStart true', () => {
    const { result } = renderHook(() => useCountdown(10));
    expect(result.current.secondsLeft).toBe(10);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isComplete).toBe(false);
  });

  it('ticks down each interval', () => {
    const { result } = renderHook(() => useCountdown(3, { interval: 1000 }));
    expect(result.current.secondsLeft).toBe(3);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(2);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it('calls onComplete when reaching 0', () => {
    const onComplete = vi.fn();
    renderHook(() => useCountdown(1, { onComplete }));
    act(() => vi.advanceTimersByTime(1000));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pause stops ticking, start resumes', () => {
    const { result } = renderHook(() => useCountdown(5));
    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.secondsLeft).toBe(5);
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(4);
  });

  it('reset restores initial and respects newSeconds', () => {
    const { result } = renderHook(() => useCountdown(5));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.secondsLeft).toBe(3);
    act(() => result.current.reset());
    expect(result.current.secondsLeft).toBe(5);
    act(() => result.current.reset(10));
    expect(result.current.secondsLeft).toBe(10);
  });

  it('autoStart false does not start', () => {
    const { result } = renderHook(() => useCountdown(5, { autoStart: false }));
    expect(result.current.isRunning).toBe(false);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.secondsLeft).toBe(5);
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
  });
});
