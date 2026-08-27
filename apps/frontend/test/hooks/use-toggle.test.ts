import { renderHook, act } from '@testing-library/react';
import { useToggle } from '@/hooks/useToggle';

describe('useToggle', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('respects initial true', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('toggle flips value', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('setTrue and setFalse are idempotent', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[2]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[2]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[3]());
    expect(result.current[0]).toBe(false);
  });

  it('setValue sets explicitly', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[4](true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[4](false));
    expect(result.current[0]).toBe(false);
  });

  it('callbacks are stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const [, t1, on1, off1] = result.current;
    rerender();
    const [, t2, on2, off2] = result.current;
    expect(t1).toBe(t2);
    expect(on1).toBe(on2);
    expect(off1).toBe(off2);
  });
});
