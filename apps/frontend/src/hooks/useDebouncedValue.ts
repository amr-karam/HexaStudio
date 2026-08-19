'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * milliseconds of inactivity. The returned value lags behind the input,
 * which is ideal for search inputs, auto-save triggers, or API call
 * throttling where you don't want to fire on every keystroke.
 *
 * Uses a `setTimeout`/`clearTimeout` pair inside a single `useEffect`.
 * The effect re-runs whenever `value` changes, resetting the timer.
 *
 * @param value   The value to debounce.
 * @param delay   Milliseconds to wait after the last change before
 *                committing the new value. Defaults to 300ms.
 * @returns       The debounced value.
 *
 * @example
 * const debouncedQuery = useDebouncedValue(searchTerm, 500);
 * useEffect(() => { if (debouncedQuery) fetchResults(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

/**
 * Returns a debounced, memoised version of the supplied callback. The
 * callback is not invoked until `delay` ms have elapsed without further
 * calls.
 *
 * The returned function has a stable identity (`useCallback`) so it is safe
 * to use as a dependency or event-handler prop without causing re-renders.
 * The timeout ID is stored in a ref, so clearing/setting timeouts never
 * triggers a React state update.
 *
 * @param callback  The function to debounce.
 * @param delay     Milliseconds to wait. Defaults to 300ms.
 * @returns         A debounced, memoised callback.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>): void => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay],
  );

  return debounced;
}
