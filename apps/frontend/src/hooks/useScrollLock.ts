'use client';

import { useEffect, useRef } from 'react';

/**
 * Locks body scroll when `locked` is true. Restores previous `overflow`
 * and `paddingRight` (scrollbar compensation) on unlock/unmount.
 * Safe to call multiple times — last locker wins, restore is idempotent.
 *
 * @param locked  whether scroll should be locked
 * @param options  optional target element (default document.body) and inert target
 */
export function useScrollLock(
  locked: boolean,
  options: { inertSelector?: string } = {},
): void {
  const prevOverflow = useRef<string | null>(null);
  const prevPaddingRight = useRef<string | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (locked && !lockedRef.current) {
      prevOverflow.current = document.body.style.overflow;
      prevPaddingRight.current = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      if (options.inertSelector) {
        const el = document.querySelector(options.inertSelector);
        el?.setAttribute('inert', '');
        el?.setAttribute('aria-hidden', 'true');
      }
      lockedRef.current = true;
    } else if (!locked && lockedRef.current) {
      document.body.style.overflow = prevOverflow.current ?? '';
      document.body.style.paddingRight = prevPaddingRight.current ?? '';
      if (options.inertSelector) {
        const el = document.querySelector(options.inertSelector);
        el?.removeAttribute('inert');
        el?.removeAttribute('aria-hidden');
      }
      lockedRef.current = false;
    }

    return () => {
      if (lockedRef.current) {
        document.body.style.overflow = prevOverflow.current ?? '';
        document.body.style.paddingRight = prevPaddingRight.current ?? '';
        if (options.inertSelector) {
          const el = document.querySelector(options.inertSelector);
          el?.removeAttribute('inert');
          el?.removeAttribute('aria-hidden');
        }
        lockedRef.current = false;
      }
    };
  }, [locked, options.inertSelector]);
}
