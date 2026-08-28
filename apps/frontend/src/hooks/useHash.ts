'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseHashOptions {
  /** If true, keep the leading '#' in the value. Default false. */
  includeHash?: boolean;
  /** If true, only trigger on hash changes without the '#' prefix (e.g. `?foo=bar` fragment). Default false. */
  matchRawHash?: boolean;
}

/**
 * Track URL hash (#fragment). Returns clean hash string (or with '#' if requested),
 * plus a setter to change it (adds/removes history entry by default), and an onChange
 * callback ref.
 *
 * @example
 * const hash = useHash();                 // 'foo' when URL is #foo
 * const hash = useHash({ includeHash: true }); // '#foo'
 * useHash((h) => { if (h === 'edit') openEditor(); });
 * useHash().setValue('new-hash');         // navigates to #new-hash
 */
export function useHash(options: UseHashOptions = {}): [
  string,
  (newHash: string) => void,
  (callback: (hash: string) => void) => void,
] {
  const { includeHash = false, matchRawHash = false } = options;

  const [hash, setHash] = useState(() => {
    const raw = typeof window !== 'undefined' && window.location.hash;
    if (!raw) return '';
    const decoded = decodeURIComponent(raw);
    return matchRawHash ? decoded : (includeHash ? decoded : decoded.replace(/^#/, ''));
  });

  // Stable callback ref for onChange listeners
  const onChangeRef = useRef<((hash: string) => void) | null>(null);
  onChangeRef.current = (cb: (hash: string) => void) => {
    onChangeRef.current = cb;
  };

  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash;
      const decoded = raw ? decodeURIComponent(raw) : '';
      const next = matchRawHash ? decoded : includeHash ? decoded : decoded.replace(/^#/, '');
      setHash(next);
      onChangeRef.current?.(next);
    };

    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [matchRawHash, includeHash]);

  const setValue = useCallback(
    (newHash: string) => {
      // Normalize: always store as '#...' in the URL
      const normalized = newHash ? `#${encodeURIComponent(newHash)}` : '';
      const current = window.location.hash;

      if (current === normalized) return;

      // If we want to replace (no history entry), use history.replaceState
      // Otherwise push a new state.
      window.history.pushState(null, '', normalized);
      // Manually trigger the handler since pushState doesn't fire hashchange
      const decoded = decodeURIComponent(normalized);
      const next = matchRawHash ? decoded : includeHash ? decoded : decoded.replace(/^#/, '');
      setHash(next);
      onChangeRef.current?.(next);
    },
    [matchRawHash, includeHash],
  );

  return [hash, setValue, onChangeRef.current];
}
