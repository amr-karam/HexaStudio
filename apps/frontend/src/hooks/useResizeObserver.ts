'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface ResizeObserverEntry {
  width: number;
  height: number;
  x: number;
  y: number;
  contentRect: DOMRectReadOnly;
}

export interface UseResizeObserverOptions {
  enabled?: boolean;
  target?: Element | React.RefObject<Element | null>;
  box?: 'content-box' | 'border-box';
}

export interface UseResizeObserverReturn {
  ref: (node: Element | null) => void;
  entry: ResizeObserverEntry | null;
  width: number;
  height: number;
}

/**
 * Observe a single element's size changes via ResizeObserver.
 *
 * Two modes:
 * - `ref`-based: `const { ref, width, height } = useResizeObserver(); <div ref={ref}>`
 * - `target`-based: `const { width, height } = useResizeObserver({ target: myRef });`
 *
 * `target` may be an Element or a RefObject<Element | null>.
 */
export function useResizeObserver(
  options: UseResizeObserverOptions = {},
): UseResizeObserverReturn {
  const { enabled = true, target: explicitTarget, box = 'content-box' } = options;

  const entryRef = useRef<ResizeObserverEntry | null>(null);
  const targetRef = useRef<Element | null>(null);
  const observerRef = useRef<globalThis.ResizeObserver | null>(null);

  // Callback ref for the element. When no explicit target, this is the element
  // we observe. When explicit target given, this still stores the element for
  // potential styling/layout but is not observed.
  const setRef = useCallback(
    (node: Element | null) => {
      if (explicitTarget !== undefined) {
        // explicit target given — this ref is just for the element itself
        // (so it renders normally). Don't observe via this ref.
        return;
      }
      targetRef.current = node;
    },
    [explicitTarget],
  );

  useEffect(() => {
    // Resolve target: explicit target (Element or RefObject) or callback ref
    const target: Element | null =
      explicitTarget !== undefined
        ? explicitTarget instanceof Element
          ? explicitTarget
          : (explicitTarget as React.RefObject<Element | null>).current ?? null
        : targetRef.current;

    if (!enabled || !target) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      entryRef.current = null;
      return;
    }

    const observer = new globalThis.ResizeObserver((entries) => {
      const first = entries[0];
      if (!first) return;
      const contentRect = first.contentRect;
      entryRef.current = {
        width: contentRect.width,
        height: contentRect.height,
        x: contentRect.x,
        y: contentRect.y,
        contentRect,
      };
    });
    observer.observe(target, { box });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [enabled, explicitTarget, box]);

  return {
    ref: setRef,
    entry: entryRef.current,
    width: entryRef.current?.width ?? 0,
    height: entryRef.current?.height ?? 0,
  };
}
