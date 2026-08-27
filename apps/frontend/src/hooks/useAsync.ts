'use client';

import { useCallback, useState, useRef } from 'react';
import { useIsMounted } from './useIsMounted';

export interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseAsyncReturn<T, Args extends unknown[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Wraps an async function with loading/error/data state + mounted guard.
 * Unlike ad-hoc `useState` + `try/catch` in each component, this is a single
 * reusable primitive for data fetching, mutations, and any promise.
 *
 * @param asyncFn  the async work (stable ref or inline — will be stored in ref)
 * @param immediate if true, auto-executes on mount
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  immediate = false,
): UseAsyncReturn<T, Args> {
  const isMounted = useIsMounted();
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setState((s) => ({ ...s, isLoading: true, error: null, isError: false }));
      try {
        const data = await fnRef.current(...args);
        if (!isMounted()) return data;
        setState({ data, error: null, isLoading: false, isSuccess: true, isError: false });
        return data;
      } catch (e) {
        if (!isMounted()) return undefined;
        const error = e instanceof Error ? e : new Error(String(e));
        setState({ data: null, error, isLoading: false, isSuccess: false, isError: true });
        return undefined;
      }
    },
    [isMounted],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false, isSuccess: false, isError: false });
  }, []);

  return { ...state, execute, reset };
}
