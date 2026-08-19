'use client';

import { useState, useEffect, useRef, type RefCallback } from 'react';

export interface ObservedEntry {
  /** Whether the element is currently intersecting. */
  isIntersecting: boolean;
  /** Ratio of the element that is visible (0–1). */
  intersectionRatio: number;
  /** Bounding client rect of the target. */
  boundingClientRect: DOMRectReadOnly;
  /** Bounding client rect of the root (null = viewport). */
  rootBounds: DOMRectReadOnly | null;
  /** The visible area of the intersection. */
  intersectionRect: DOMRectReadOnly;
  /** True when the element has any visible pixels intersecting. */
  isVisible: boolean;
  /** The target element being observed. */
  target: Element;
}

export interface IntersectionObserverOptions {
  /** The root element or viewport. `null` = viewport. */
  root?: Element | null;
  /** Margin around the root. */
  rootMargin?: string;
  /** Thresholds at which to fire callback (0–1). */
  threshold?: number | number[];
  /** Once true, disconnects the observer after the element first intersects. */
  once?: boolean;
}

/**
 * React-friendly wrapper around the native `IntersectionObserver` API.
 *
 * Tracks whether a referenced element is visible within the viewport
 * (or a parent container). The returned state updates automatically as the
 * element enters/leaves the intersection area.
 *
 * When `once` is `true`, the observer auto-unsubscribes after the element
 * is first seen intersecting — ideal for entry animations and lazy loading.
 *
 * Falls back to `isIntersecting: false` when `IntersectionObserver` is
 * unavailable (SSR / older browsers).
 *
 * Uses a callback ref internally so the observer is always connected to the
 * correct DOM node, even if React swaps it out during re-renders.
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ once: true });
 * <div ref={ref}>{isIntersecting && <LazyContent />}</div>
 */
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {},
): { ref: RefCallback<HTMLDivElement>; isIntersecting: boolean; entry: ObservedEntry | null } {
  const { root = null, rootMargin = '0px', threshold = 0, once = false } = options;

  const [entry, setEntry] = useState<ObservedEntry | null>(null);

  // Keep the latest options in a ref so the callback ref closure always
  // sees the current values without being re-created on every render.
  const optionsRef = useRef({ root, rootMargin, threshold, once });
  optionsRef.current = { root, rootMargin, threshold, once };

  // We store the active observer in a ref so the callback ref can clean it
  // up before creating a new one (avoids double-observe on React re-renders).
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref: RefCallback<HTMLDivElement> = (node): void => {
    // Clean up the previous observer if the ref was already attached.
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) {
      setEntry(null);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setEntry({
        isIntersecting: false,
        intersectionRatio: 0,
        boundingClientRect: node.getBoundingClientRect(),
        rootBounds: null,
        intersectionRect: node.getBoundingClientRect(),
        isVisible: false,
        target: node,
      });
      return;
    }

    const observer = new IntersectionObserver(
      (observedEntries: IntersectionObserverEntry[]) => {
        observedEntries.forEach((observedEntry) => {
          setEntry({
            isIntersecting: observedEntry.isIntersecting,
            intersectionRatio: observedEntry.intersectionRatio,
            boundingClientRect: observedEntry.boundingClientRect,
            rootBounds: observedEntry.rootBounds,
            intersectionRect: observedEntry.intersectionRect,
            isVisible: observedEntry.isIntersecting && observedEntry.intersectionRatio > 0,
            target: observedEntry.target,
          });

          if (optionsRef.current.once && observedEntry.isIntersecting) {
            observer.unobserve(observedEntry.target);
          }
        });
      },
      {
        root: optionsRef.current.root,
        rootMargin: optionsRef.current.rootMargin,
        threshold: optionsRef.current.threshold,
      },
    );

    observer.observe(node);
    observerRef.current = observer;
  };

  // Ensure the observer is disconnected when the component unmounts.
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return {
    ref,
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
  };
}
