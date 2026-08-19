'use client';

import { useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * A key combination specification.
 *
 * `key` is case-insensitive for single-character keys (e.g. `'k'` matches `K` and `k`).
 * Modifier flags use the platform-agnostic convention: `ctrlCmd` means
 * `Meta` on macOS / `Control` on Windows & Linux.
 *
 * @example
 * useKeyboardShortcut('k', () => toggle(), { ctrlCmd: true })  // Cmd/Ctrl+K
 */
export interface KeyboardShortcutOptions {
  /** When true, requires `Meta` (macOS) or `Control` (Windows/Linux). */
  ctrlCmd?: boolean;
  /** When true, requires the `Alt` modifier. */
  alt?: boolean;
  /** When true, requires the `Shift` modifier. */
  shift?: boolean;
  /** Prevent the browser's default action for this key combo. Defaults to true. */
  preventDefault?: boolean;
  /** Listen on `window` (default) or `document`. */
  target?: 'window' | 'document';
  /** Only trigger when the event was not composed inside an input/textarea. Defaults to true. */
  ignoreInput?: boolean;
  /** Only trigger when the user is NOT composing (IME). Defaults to true. */
  ignoreIME?: boolean;
}

/**
 * Registers a single keyboard shortcut and fires the callback when the
 * combination is pressed.
 *
 * This hook centralises the pattern currently duplicated across
 * `CommandPalette`, `Navbar`, `PortalNav`, and modal components — each of
 * which manually wires `addEventListener('keydown', ...)` with ad-hoc
 * modifier checks.
 *
 * Cross-platform: `ctrlCmd: true` matches `Meta` on macOS and `Control`
 * on Windows/Linux, so `"k"` + `{ ctrlCmd: true }` produces the universal
 * "Cmd/Ctrl+K" shortcut.
 *
 * @param key       The key to listen for (e.g. `'k'`, `'Enter'`, `'Escape'`).
 * @param callback  Invoked when the shortcut fires. Receives the original
 *                  `KeyboardEvent`.
 * @param options   Modifier and behaviour options.
 *
 * @example
 * useKeyboardShortcut('k', () => setOpen(true), { ctrlCmd: true });
 * useKeyboardShortcut('Escape', () => setOpen(false));
 */
export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: KeyboardShortcutOptions = {},
): void {
  const {
    ctrlCmd = false,
    alt = false,
    shift = false,
    preventDefault = true,
    target = 'window',
    ignoreInput = true,
    ignoreIME = true,
  } = options;

  // Store the latest callback in a ref so the listener doesn't need to be
  // re-attached on every render.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const normalizedKey = key.toLowerCase();

  useEffect(() => {
    const element: Window | Document =
      target === 'window' ? window : document;

    const handler = (event: Event): void => {
      const keyboardEvent = event as KeyboardEvent;

      // Ignore IME composition (e.g. Japanese/Korean input).
      if (ignoreIME && keyboardEvent.isComposing) return;

      // Ignore when typing inside an input/textarea/contenteditable.
      if (ignoreInput) {
        const eventTarget = keyboardEvent.target as EventTarget | null;
        if (eventTarget instanceof HTMLElement) {
          const isFormElement =
            eventTarget instanceof HTMLInputElement ||
            eventTarget instanceof HTMLTextAreaElement ||
            eventTarget.getAttribute('contenteditable') === 'true';
          if (isFormElement && !eventTarget.hasAttribute('data-shortcut-ok')) return;
        }
      }

      // Key must match (case-insensitive for single chars).
      if (keyboardEvent.key.toLowerCase() !== normalizedKey) return;

      // Modifier checks.
      if (ctrlCmd && !(keyboardEvent.metaKey || keyboardEvent.ctrlKey)) return;
      if (!ctrlCmd) {
        // When ctrlCmd is not requested, ensure neither meta nor ctrl is pressed
        // (unless they are explicitly part of another modifier).
        if (keyboardEvent.metaKey || keyboardEvent.ctrlKey) return;
      }
      if (alt !== keyboardEvent.altKey) return;
      if (shift !== keyboardEvent.shiftKey) return;

      // All conditions met — fire the callback.
      if (preventDefault) keyboardEvent.preventDefault();
      callbackRef.current(keyboardEvent);
    };

    element.addEventListener('keydown', handler);

    return () => {
      element.removeEventListener('keydown', handler);
    };
  }, [normalizedKey, ctrlCmd, alt, shift, preventDefault, target, ignoreInput, ignoreIME]);
}

/**
 * Returns true when the given KeyboardEvent matches the specified key combo.
 * Pure function — no event listeners — useful for inline checks in render
 * or within other event handlers.
 *
 * @example
 * if (isKeyCombo(event, 'Escape')) close();
 */
export function isKeyCombo(
  event: KeyboardEvent | ReactKeyboardEvent,
  key: string,
  options: KeyboardShortcutOptions = {},
): boolean {
  const { ctrlCmd = false, alt = false, shift = false } = options;
  const normalizedKey = key.toLowerCase();

  if (event.key.toLowerCase() !== normalizedKey) return false;
  if (ctrlCmd && !(event.metaKey || event.ctrlKey)) return false;
  if (!ctrlCmd && (event.metaKey || event.ctrlKey)) return false;
  if (alt !== event.altKey) return false;
  if (shift !== event.shiftKey) return false;

  return true;
}
