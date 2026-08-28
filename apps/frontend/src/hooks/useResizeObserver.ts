'use client';

import { useEffect, useState, useCallback } from 'react';

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

  // Latest entry as STATE so consumers re-render when the observed size changes.
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);
  // Observed element for ref-based mode. Stored as state (not a ref) so that
  // the callback ref setting the node re-runs the observation effect below.
  const [observedNode, setObservedNode] = useState<Element | null>(null);

  // Callback ref for the element. When no explicit target, this is the element
  // we observe. When an explicit target is given, this ref is just for the
  // element itself and is not observed.
  const setRef = useCallback(
    (node: Element | null) => {
      if (explicitTarget !== undefined) return;
      setObservedNode((prev) => (prev === node ? prev : node));
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
        : observedNode;

    if (!enabled || !target) {
      setEntry(null);
      return;
    }

    const observer = new globalThis.ResizeObserver((entries) => {
      const first = entries[0];
      if (!first) return;
      const contentRect = first.contentRect;
      setEntry({
        width: contentRect.width,
        height: contentRect.height,
        x: contentRect.x,
        y: contentRect.y,
        contentRect,
      });
    });
    observer.observe(target, { box });

    return () => {
      observer.disconnect();
    };
  }, [enabled, explicitTarget, box, observedNode]);

  return {
    ref: setRef,
    entry,
    width: entry?.width ?? 0,
    height: entry?.height ?? 0,
  };
}
