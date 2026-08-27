import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetch } from '@/hooks/useFetch';

describe('useFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches and sets data on success', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ id: 1 }), text: async () => '' }) as Response);
    const { result } = renderHook(() => useFetch<{ id: number }>('https://api.test/data'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: 1 });
    expect(result.current.isSuccess).toBe(true);
  });

  it('sets error on non-ok response', async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 500, statusText: 'Server Error', json: async () => ({}), text: async () => '' }) as Response);
    const { result } = renderHook(() => useFetch('/bad'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toMatch(/500/);
  });

  it('aborts previous request on url change', async () => {
    const abortSpy = vi.fn();
    global.fetch = vi.fn(async (_input: RequestInfo | URL, opts?: RequestInit) => {
      // capture abort signal behavior
      opts?.signal?.addEventListener('abort', abortSpy);
      await new Promise((r) => setTimeout(r, 50));
      return { ok: true, json: async () => ({ ok: true }), text: async () => '' } as Response;
    });
    const { rerender } = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/a' } });
    rerender({ url: '/b' });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/b', expect.anything()));
    // abort was triggered for /a's controller when url changed
    expect(abortSpy).toHaveBeenCalledTimes(1);
  });

  it('disabled does not fetch', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({}), text: async () => '' }) as Response);
    const { result } = renderHook(() => useFetch('/data', { enabled: false }));
    await new Promise((r) => setTimeout(r, 50));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('refetch re-fetches', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ n: 1 }), text: async () => '' }) as Response);
    const { result } = renderHook(() => useFetch<{ n: number }>('/data'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  it('null url disables fetch', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({}), text: async () => '' }) as Response);
    renderHook(() => useFetch(null));
    await new Promise((r) => setTimeout(r, 50));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
