'use client';

import { useEffect, useCallback, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps focus inside a container (Tab / Shift+Tab cycles).
 * Optionally autofocuses the first focusable or a specific element on activation.
 *
 * @param containerRef  element to trap within
 * @param active        enable trap
 * @param options       initialFocus: HTMLElement | 'first' | 'container' (default 'first')
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  options: { initialFocus?: HTMLElement | 'first' | 'container' } = {},
): void {
  const { initialFocus = 'first' } = options;
  const initialFocusRef = useRef(initialFocus);
  initialFocusRef.current = initialFocus;

  const trap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const container = containerRef.current;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [containerRef]);

  useEffect(() => {
    if (!active) return;

    // initial focus
    const raf = requestAnimationFrame(() => {
      const target = initialFocusRef.current;
      if (target instanceof HTMLElement) {
        target.focus();
      } else if (target === 'container') {
        containerRef.current?.focus();
      } else {
        const container = containerRef.current;
        const first = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus();
      }
    });

    document.addEventListener('keydown', trap);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', trap);
    };
  }, [active, trap, containerRef]);
}
