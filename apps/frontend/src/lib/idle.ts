/**
 * onIdle — schedule non-critical work for browser idle time.
 *
 * Used to move GSAP ScrollTrigger registration/module evaluation off the
 * post-hydration critical path (TBT reduction). The callback is guaranteed
 * to run within `timeout` ms even under sustained main-thread load.
 *
 * Safari lacks requestIdleCallback — falls back to a macrotask deferral,
 * which still breaks up the hydration long-task chain.
 *
 * @returns cancel function (safe to call multiple times)
 */
export function onIdle(callback: () => void, timeout = 1500): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout });
    let cancelled = false;
    return () => {
      if (cancelled) return;
      cancelled = true;
      window.cancelIdleCallback(id);
    };
  }

  const id = window.setTimeout(callback, 1);
  let cancelled = false;
  return () => {
    if (cancelled) return;
    cancelled = true;
    window.clearTimeout(id);
  };
}
