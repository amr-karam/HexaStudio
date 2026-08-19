import { renderHook } from '@testing-library/react';
import { usePrevious } from '@/hooks/usePrevious';

describe('usePrevious', () => {
  it('returns undefined on first render when no initialValue is provided', () => {
    const { result } = renderHook(() => usePrevious('hello'));
    expect(result.current).toBeUndefined();
  });

  it('returns the initialValue on first render when provided', () => {
    const { result } = renderHook(() => usePrevious('hello', 'initial'));
    expect(result.current).toBe('initial');
  });

  it('returns the previous value after an update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value, 'init'), {
      initialProps: { value: 'first' },
    });
    // First render: ref.current is set to 'init', but the returned value
    // is the initial ref value which is 'init' (the initialValue).
    expect(result.current).toBe('init');

    rerender({ value: 'second' });
    // After update, ref.current is still 'init' (previous value), but now
    // the useEffect has set ref.current to 'first', so next render returns 'first'.
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('works with objects', () => {
    const obj1 = { id: 1, name: 'Alice' };
    const obj2 = { id: 2, name: 'Bob' };
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    });
    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toEqual(obj1);
  });

  it('works with numbers', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value, 0), {
      initialProps: { value: 1 },
    });
    expect(result.current).toBe(0);

    rerender({ value: 5 });
    expect(result.current).toBe(1);

    rerender({ value: 10 });
    expect(result.current).toBe(5);
  });

  it('returns the correct previous value through multiple rerenders', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBeUndefined();

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    rerender({ value: 'c' });
    expect(result.current).toBe('b');

    rerender({ value: 'd' });
    expect(result.current).toBe('c');
  });

  it('returns undefined consistently when value never changes', () => {
    const { result } = renderHook(() => usePrevious('constant'));
    expect(result.current).toBeUndefined();
  });
});
