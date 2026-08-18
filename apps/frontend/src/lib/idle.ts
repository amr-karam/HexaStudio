/**
 * onIdle / scheduleIdle — schedule non-critical work for browser idle time.
 *
 * Used to move GSAP ScrollTrigger registration off the post-hydration
 * critical path (TBT reduction).
 *
 * `onIdle` — single callback, guaranteed to run within `timeout` ms even
 * under sustained main-thread load. Kept for one-off deferred work
 * (analytics init, hero cascade).
 *
 * `scheduleIdle` — shared, batched idle scheduler for ScrollTrigger /
 * animation setup. Every caller queues into ONE requestIdleCallback that
 * drains with a per-frame deadline check. Previously each per-instance
 * `onIdle(..., 1200)` timed out under load and serialized into
 * 300–700 ms long tasks (the Aug-17 TBT regression); batching keeps each
 * frame's work bounded and lets the browser schedule the drain between
 * frames. Work is guaranteed to start within `timeout` (default 5000 ms)
 * even on a busy thread.
 *
 * Safari lacks requestIdleCallback — falls back to a macrotask queue with
 * small per-tick drains, which still breaks up the hydration long-task
 * chain.
 *
 * @returns cancel function (safe to call multiple times)
 */

interface IdleTask {
  run: () => void;
  timeout: number;
}

const QUEUE: IdleTask[] = [];
let flushHandle: number | null = null;
let fallbackTimer: number | null = null;

function armFlush(timeout: number): void {
  if (flushHandle !== null || fallbackTimer !== null) return;
  if (typeof window.requestIdleCallback === 'function') {
    flushHandle = window.requestIdleCallback(flush, { timeout });
  } else {
    fallbackTimer = window.setTimeout(fallbackTick, 1);
  }
}

function drainQueue(timeRemaining: () => number): void {
  while (QUEUE.length > 0) {
    if (timeRemaining() <= 0) break;
    const task = QUEUE.shift();
    if (task) task.run();
  }
}

function flush(deadline: IdleDeadline): void {
  flushHandle = null;
  drainQueue(() => deadline.timeRemaining());
  if (QUEUE.length > 0) {
    armFlush(Math.min(...QUEUE.map((task) => task.timeout)));
  }
}

/** Safari / browsers without requestIdleCallback — small per-tick drains. */
function fallbackTick(): void {
  fallbackTimer = null;
  let ran = 0;
  while (QUEUE.length > 0 && ran < 2) {
    const task = QUEUE.shift();
    if (task) {
      task.run();
      ran += 1;
    }
  }
  if (QUEUE.length > 0) {
    fallbackTimer = window.setTimeout(fallbackTick, 1);
  }
}

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

export function scheduleIdle(callback: () => void, timeout = 5000): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const task: IdleTask = { run: callback, timeout };
  QUEUE.push(task);
  armFlush(timeout);

  let cancelled = false;
  return () => {
    if (cancelled) return;
    cancelled = true;
    const index = QUEUE.indexOf(task);
    if (index >= 0) QUEUE.splice(index, 1);
  };
}
