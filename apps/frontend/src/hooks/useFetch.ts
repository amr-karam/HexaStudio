'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchOptions extends RequestInit {
  /** skip fetch when false (manual mode) */
  enabled?: boolean;
  /** parse as json (default true) */
  json?: boolean;
}

export interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
  abort: () => void;
}

/**
 * Typed fetch with AbortController, mounted guard, and loading/error state.
 * Replaces scattered `useEffect(()=>{ fetch().then(setData)... })` with a single primitive.
 *
 * @param url  fetch url (null disables)
 * @param options  fetch options + { enabled, json }
 */
export function useFetch<T = unknown>(url: string | null, options: UseFetchOptions = {}): UseFetchReturn<T> {
  const { enabled = true, json = true, ...fetchInit } = options;
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    error: null,
    isLoading: !!url && enabled,
    isSuccess: false,
    isError: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef(url);
  urlRef.current = url;

  const fetchData = useCallback(async () => {
    const currentUrl = urlRef.current;
    if (!currentUrl || !enabled) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((s) => ({ ...s, isLoading: true, error: null, isError: false }));
    try {
      const res = await fetch(currentUrl, { ...fetchInit, signal: controller.signal });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      const data = (json ? await res.json() : await res.text()) as T;
      if (controller.signal.aborted) return;
      setState({ data, error: null, isLoading: false, isSuccess: true, isError: false });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      const error = e instanceof Error ? e : new Error(String(e));
      setState({ data: null, error, isLoading: false, isSuccess: false, isError: true });
    }
  }, [enabled, json, fetchInit]);

  const abort = useCallback(() => abortRef.current?.abort(), []);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [url, enabled]);

  return { ...state, refetch: fetchData, abort };
}
