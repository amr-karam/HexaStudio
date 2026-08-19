'use client';

import { useRef, useEffect } from 'react';

/**
 * Attaches an event listener to a DOM element (or `window`/`document`)
 * and automatically removes it on unmount.
 *
 * Supports both DOM event targets (via the `target` prop) and the special
 * strings `'window'` / `'document'` for global listeners.
 *
 * The callback is stored in a ref, so the listener identity is stable
 * even if the consumer passes a new function on every render — no
 * unnecessary add/remove cycles.
 *
 * @example
 * // Listen to window resize
 * useEvent('resize', () => setSize(getSize()), { target: 'window' });
 *
 * @example
 * // Listen to a click on a specific element
 * const ref = useRef<HTMLButtonElement>(null);
 * useEvent('click', () => alert('clicked!'), { target: ref });
 *
 * @param eventName  The DOM event name (e.g. 'resize', 'click', 'keydown').
 * @param handler    The event handler callback.
 * @param options    Optional configuration.
 * @param options.target   A ref, an Element, or 'window' / 'document'.
 * @param options.once      If true, the listener is automatically removed after the first call.
 * @param options.passive   If true, indicates the handler won't call preventDefault().
 */
export function useEvent<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: {
    target?: 'window' | 'document' | Window | Document | Element | React.RefObject<Element>;
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
  },
): void;

export function useEvent<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: {
    target?: 'window' | 'document' | Window | Document | Element | React.RefObject<Element>;
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
  },
): void;

export function useEvent<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: {
    target?: 'window' | 'document' | Window | Document | Element | React.RefObject<Element>;
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
  },
): void;

export function useEvent(
  eventName: string,
  handler: (event: Event) => void,
  options?: {
    target?: 'window' | 'document' | Window | Document | Element | React.RefObject<Element>;
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
  },
): void {
  const { target = 'window', once = false, passive = false, capture = false } = options ?? {};

  // Store the latest handler in a ref so the stable listener always calls
  // the current callback without needing to re-subscribe.
  const handlerRef = useRef<(event: Event) => void>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let element: EventTarget | null;

    if (target === 'window') {
      element = window;
    } else if (target === 'document') {
      element = document;
    } else if (target == null) {
      element = null;
    } else if (typeof target === 'string') {
      // Unknown string — treat as null (shouldn't happen with typed API).
      element = null;
    } else if ('current' in target && target.current === null) {
      // Ref not yet attached.
      element = null;
    } else if ('current' in target && target.current instanceof Element) {
      element = target.current;
    } else if (target instanceof Element || target instanceof Window || target instanceof Document) {
      element = target;
    } else {
      element = null;
    }

    if (!element) return;

    const listener = (event: Event): void => {
      handlerRef.current(event);
    };

    const listenerOptions: AddEventListenerOptions = { passive, once, capture };

    element.addEventListener(eventName, listener, listenerOptions);

    return () => {
      element.removeEventListener(eventName, listener, listenerOptions);
    };
  }, [eventName, target, once, passive, capture]);
}
