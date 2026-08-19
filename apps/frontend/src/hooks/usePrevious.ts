'use client';

import { useRef, useEffect } from 'react';

/**
 * Returns the previous value of a prop or state, captured *before* the
 * current render committed. Useful for detecting value deltas, animating
 * out stale items, or building diff-aware UIs.
 *
 * The value is stored in a `useRef` so it survives re-renders without
 * triggering them. On the first render `undefined` is returned (there is
 * no "previous" yet) unless an explicit `initialValue` is supplied.
 *
 * @example
 * const prev = usePrevious(count, 0);
 * if (prev !== count) { /* count changed *\/ }
 */
export function usePrevious<T>(value: T, initialValue?: T): T {
  const ref = useRef<T>(initialValue);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // On the first render ref.current === the initialValue prop (or undefined).
  return ref.current as T;
}
