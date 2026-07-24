/**
 * Task Scheduler for TBT Optimization
 * 
 * Breaks up long-running tasks into smaller chunks to reduce Total Blocking Time
 * and improve main thread responsiveness.
 */

export interface SchedulerOptions {
  timeout?: number;
  yieldInterval?: number;
}

/**
 * Schedule a task to run after a specified timeout
 * Useful for deferring non-critical work
 */
export function scheduleTask<T>(
  task: () => T,
  timeout: number = 0
): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(task()), timeout);
  });
}

/**
 * Schedule a task to run during browser idle time
 * Falls back to setTimeout if requestIdleCallback is not available
 */
export function scheduleIdleTask<T>(
  task: () => T,
  options: { timeout?: number } = {}
): Promise<T> {
  return new Promise(resolve => {
    const requestIdleCallback = 
      window.requestIdleCallback || 
      ((cb: () => void, opts?: { timeout?: number }) => 
        setTimeout(cb, opts?.timeout || 1));

    requestIdleCallback(
      () => resolve(task()),
      { timeout: options.timeout || 2000 }
    );
  });
}

/**
 * Process large data arrays in chunks to avoid blocking the main thread
 */
export async function processInChunks<T, R>(
  data: T[],
  chunkSize: number,
  processor: (chunk: T[]) => R[],
  options: SchedulerOptions = {}
): Promise<R[]> {
  const chunks: T[][] = [];
  
  // Split data into chunks
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  const results: R[] = [];
  const yieldInterval = options.yieldInterval || 1; // Yield after each chunk by default

  for (let i = 0; i < chunks.length; i++) {
    // Process chunk
    const chunkResults = await scheduleTask(
      () => processor(chunks[i]),
      0
    );
    results.push(...chunkResults);

    // Yield to main thread periodically
    if (i % yieldInterval === 0 && i < chunks.length - 1) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }

  return results;
}

/**
 * Run a task with automatic yielding for long operations
 */
export async function runWithYielding<T>(
  task: () => T,
  maxYieldTime: number = 50 // Yield every 50ms
): Promise<T> {
  const startTime = performance.now();
  let result: T;

  const runTask = (): T => {
    const currentTime = performance.now();
    if (currentTime - startTime > maxYieldTime) {
      // Yield and continue
      throw new Error('YIELD_REQUIRED');
    }
    return task();
  };

  while (true) {
    try {
      result = runTask();
      break;
    } catch (error) {
      if (error === 'YIELD_REQUIRED') {
        await new Promise(resolve => requestAnimationFrame(resolve));
        continue;
      }
      throw error;
    }
  }

  return result;
}

/**
 * Priority-based task queue for critical vs non-critical work
 */
export class TaskQueue {
  private queue: Array<{ task: () => unknown; priority: number }> = [];
  private isProcessing = false;

  add(task: () => unknown, priority: number = 0): void {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { task } = this.queue.shift()!;
      await scheduleIdleTask(() => task());
    }

    this.isProcessing = false;
  }
}

export const taskQueue = new TaskQueue();

/**
 * Debounce function with optional immediate execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Measure task execution time for performance monitoring
 */
export async function measureTask<T>(
  task: () => T | Promise<T>,
  name: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await task();
    const duration = performance.now() - startTime;
    
    // Log slow tasks (>50ms)
    if (duration > 50) {
      console.warn(`[Performance] Slow task detected: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Performance] Task failed: ${name} after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
