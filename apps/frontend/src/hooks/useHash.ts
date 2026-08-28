'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseHashOptions {
  /** If true, keep the leading '#' in the value. Default false. */
  includeHash?: boolean;
  /** If true, return the raw hash fragment including '#' (e.g. `#?filter=active`).
   *  Default false (returns decoded hash without '#'). */
  matchRawHash?: boolean;
}

/**
 * Track URL hash (#fragment). Returns clean hash string (or with '#' if requested),
 * plus a setter to change it (pushes history entry), and a registration function for
 * onChange callbacks.
 *
 * ```ts
 * const hash = useHash();                 // 'foo' when URL is #foo
 * const hash = useHash({ includeHash: true }); // '#foo'
 *
 * // Register a callback for hash changes
 * useHash().register((h) => { if (h === 'edit') openEditor(); });
 *
 * // Set hash (pushes history entry)
 * useHash().setValue('new-hash');
 * ```
 */
export function useHash(options: UseHashOptions = {}): [
  string,
  (newHash: string) => void,
  (cb: (hash: string) => void) => void,
] {
  const { includeHash = false, matchRawHash = false } = options;

  const [hash, setHash] = useState(() => {
    if (typeof window === 'undefined') return '';
    const raw = window.location.hash;
    if (!raw) return '';
    const decoded = decodeURIComponent(raw);
    return matchRawHash ? decoded : includeHash ? decoded : decoded.replace(/^#/, '');
  });

  // Store registered callbacks in a ref so the listener doesn't need to be
  // re-attached on every render.
  const callbacksRef = useRef<((hash: string) => void)[]>([]);

  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash;
      const decoded = raw ? decodeURIComponent(raw) : '';
      const next = matchRawHash ? decoded : includeHash ? decoded : decoded.replace(/^#/, '');
      setHash(next);
      // Notify all registered callbacks
      callbacksRef.current.forEach((cb) => cb(next));
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [matchRawHash, includeHash]);

  const setValue = useCallback(
    (newHash: string) => {
      const normalized = newHash ? `#${encodeURIComponent(newHash)}` : '';
      const current = window.location.hash;
      if (current === normalized) return;
      window.history.pushState(null, '', normalized);
      // pushState doesn't fire hashchange, so notify callbacks manually
      const decoded = decodeURIComponent(normalized);
      const next = matchRawHash ? decoded : includeHash ? decoded : decoded.replace(/^#/, '');
      setHash(next);
      callbacksRef.current.forEach((cb) => cb(next));
    },
    [matchRawHash, includeHash],
  );

  // Registration function for onChange callbacks
  const register = useCallback((cb: (hash: string) => void) => {
    callbacksRef.current.push(cb);
  }, []);

  return [hash, setValue, register];
}
