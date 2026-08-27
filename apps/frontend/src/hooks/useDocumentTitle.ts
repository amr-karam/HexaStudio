'use client';

import { useEffect, useRef } from 'react';

/**
 * Syncs document.title and restores on unmount.
 * Useful for portal/detail pages where title should revert.
 *
 * @param title  desired title (empty string restores)
 * @param options  { restoreOnUnmount: true }
 */
export function useDocumentTitle(title: string, options: { restoreOnUnmount?: boolean } = {}): void {
  const { restoreOnUnmount = true } = options;
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevRef.current === null) prevRef.current = document.title;
    document.title = title;
    return () => {
      if (restoreOnUnmount && prevRef.current !== null) {
        document.title = prevRef.current;
      }
    };
  }, [title, restoreOnUnmount]);
}
