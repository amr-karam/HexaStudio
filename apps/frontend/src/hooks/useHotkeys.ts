'use client';

import { useEffect, useRef } from 'react';

/** A single key-combo → callback mapping. */
export interface Hotkey {
  /** The key to match (e.g. `'k'`, `'Enter'`, `'Escape'`). */
  key: string;
  /** Callback invoked when the combo fires. */
  callback: (event: KeyboardEvent) => void;
  /** Modifier flags (same semantics as `useKeyboardShortcut`). */
  ctrlCmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** Prevent the browser's default action. Defaults to `true`. */
  preventDefault?: boolean;
  /** Ignore events from input/textarea. Defaults to `true`. */
  ignoreInput?: boolean;
  /** Ignore IME composition events. Defaults to `true`. */
  ignoreIME?: boolean;
}

/**
 * Registers multiple keyboard shortcuts under a single `keydown` listener
 * (more efficient than calling `useKeyboardShortcut` N times).
 *
 * Each hotkey entry matches a key + optional modifiers. The first matching
 * handler fires for each keypress.
 *
 * @example
 * useHotkeys([
 *   { key: 'Escape', callback: closeDialog },
 *   { key: 'k', ctrlCmd: true, callback: openSearch },
 *   { key: 'ArrowUp', shift: true, callback: increment },
 * ]);
 */
export function useHotkeys(hotkeys: Hotkey[]): void {
  // Keep the latest hotkeys array in a ref so the listener always sees
  // the current callbacks without re-subscribing.
  const hotkeysRef = useRef<Hotkey[]>(hotkeys);
  hotkeysRef.current = hotkeys;

  useEffect(() => {
    const handler = (event: Event): void => {
      const keyboardEvent = event as KeyboardEvent;
      for (const hk of hotkeysRef.current) {
        if (keyboardEvent.isComposing && (hk.ignoreIME ?? true)) continue;

        // Modifier checks.
        const ctrlCmd = hk.ctrlCmd ?? false;
        if (ctrlCmd && !(keyboardEvent.metaKey || keyboardEvent.ctrlKey)) continue;
        if (!ctrlCmd && (keyboardEvent.metaKey || keyboardEvent.ctrlKey)) continue;
        if ((hk.alt ?? false) !== keyboardEvent.altKey) continue;
        if ((hk.shift ?? false) !== keyboardEvent.shiftKey) continue;

        // Key match (case-insensitive for single chars).
        if (keyboardEvent.key.toLowerCase() !== hk.key.toLowerCase()) continue;

        // Input/textarea guard.
        if (hk.ignoreInput ?? true) {
          const eventTarget = keyboardEvent.target as EventTarget | null;
          if (eventTarget instanceof HTMLElement) {
            const isFormElement =
              eventTarget instanceof HTMLInputElement ||
              eventTarget instanceof HTMLTextAreaElement ||
              eventTarget.getAttribute('contenteditable') === 'true';
            if (isFormElement) continue;
          }
        }

        // Match!
        if (hk.preventDefault ?? true) keyboardEvent.preventDefault();
        hk.callback(keyboardEvent);
        return; // Only the first match fires.
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
}
