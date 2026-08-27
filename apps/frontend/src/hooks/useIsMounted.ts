'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable callback that tells whether the component is still mounted.
 * Useful to guard `setState` after async work to avoid "update on unmounted component".
 *
 * @example
 * const isMounted = useIsMounted();
 * useEffect(() => {
 *   fetch(...).then(data => { if (isMounted()) setData(data); });
 * }, [isMounted]);
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}
