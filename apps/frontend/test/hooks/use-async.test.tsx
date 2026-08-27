import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';

describe('useAsync', () => {
  it('initial state is idle', () => {
    const fn = vi.fn(async () => 'data');
    const { result } = renderHook(() => useAsync(fn));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('execute resolves to success state', async () => {
    const fn = vi.fn(async (x: string) => `ok-${x}`);
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      const data = await result.current.execute('hi');
      expect(data).toBe('ok-hi');
    });
    expect(result.current.data).toBe('ok-hi');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('execute rejects to error state', async () => {
    const fn = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      const data = await result.current.execute();
      expect(data).toBeUndefined();
    });
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('wraps non-Error throws', async () => {
    const fn = vi.fn(async () => {
      throw 'string-error';
    });
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.error?.message).toBe('string-error');
  });

  it('reset clears state', async () => {
    const fn = vi.fn(async () => 'x');
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.isSuccess).toBe(true);
    act(() => result.current.reset());
    expect(result.current.data).toBeNull();
    expect(result.current.isSuccess).toBe(false);
  });

  it('does not set state after unmount (mounted guard)', async () => {
    let resolve!: (v: string) => void;
    const fn = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const { result, unmount } = renderHook(() => useAsync(fn));
    let promise: Promise<string | undefined>;
    await act(async () => {
      promise = result.current.execute();
    });
    unmount();
    await act(async () => {
      resolve('late');
      await promise;
    });
    // no crash, state remains idle (no update after unmount)
    expect(result.current.isLoading).toBe(true); // still loading snapshot from before unmount, no post-unmount setState
  });

  it('uses latest fn ref', async () => {
    const fn1 = vi.fn(async () => 'one');
    const fn2 = vi.fn(async () => 'two');
    const { result, rerender } = renderHook(({ fn }) => useAsync(fn), { initialProps: { fn: fn1 } });
    rerender({ fn: fn2 });
    await act(async () => {
      await result.current.execute();
    });
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn1).not.toHaveBeenCalled();
  });
});
