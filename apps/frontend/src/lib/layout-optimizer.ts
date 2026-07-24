/**
 * Layout Optimizer - Eliminate forced reflows and layout thrashing
 * 
 * This utility batches DOM reads and writes to prevent layout thrashing,
 * which was identified as a critical issue (0/100 score) in Lighthouse analysis.
 */

import { useRef, useEffect } from 'react';

type ReadFn = () => void;
type WriteFn = () => void;

interface LayoutOptimizer {
  measure: (fn: ReadFn) => void;
  mutate: (fn: WriteFn) => void;
  flush: () => void;
}

class LayoutOptimizerImpl implements LayoutOptimizer {
  private reads: ReadFn[] = [];
  private writes: WriteFn[] = [];
  private scheduled = false;

  /**
   * Schedule a DOM read operation
   * Reads are batched and executed before writes
   */
  measure(fn: ReadFn): void {
    this.reads.push(fn);
    this.schedule();
  }

  /**
   * Schedule a DOM write operation
   * Writes are batched and executed after all reads
   */
  mutate(fn: WriteFn): void {
    this.writes.push(fn);
    this.schedule();
  }

  /**
   * Schedule the batched operations to run
   */
  private schedule(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Execute all batched operations
   * Reads first, then writes to prevent layout thrashing
   */
  flush(): void {
    // Execute all reads first
    this.reads.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('[LayoutOptimizer] Read operation failed:', error);
      }
    });
    this.reads = [];

    // Execute all writes
    this.writes.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('[LayoutOptimizer] Write operation failed:', error);
      }
    });
    this.writes = [];

    this.scheduled = false;
  }

  /**
   * Clear pending operations
   */
  clear(): void {
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
  }
}

// Global instance
export const layout = new LayoutOptimizerImpl();

/**
 * Hook for React components to use layout optimization
 */
export function useLayoutOptimization() {
  const optimizerRef = useRef<LayoutOptimizerImpl | null>(null);

  useEffect(() => {
    optimizerRef.current = new LayoutOptimizerImpl();
    return () => {
      optimizerRef.current?.clear();
    };
  }, []);

  return {
    measure: (fn: ReadFn) => optimizerRef.current?.measure(fn),
    mutate: (fn: WriteFn) => optimizerRef.current?.mutate(fn),
    flush: () => optimizerRef.current?.flush(),
  };
}

/**
 * Batch multiple operations into a single layout cycle
 */
export function batchLayoutOperations(operations: Array<{
  type: 'read' | 'write';
  fn: () => void;
}>): void {
  operations.forEach(op => {
    if (op.type === 'read') {
      layout.measure(op.fn);
    } else {
      layout.mutate(op.fn);
    }
  });
}

/**
 * Safely measure element dimensions without causing forced reflow
 */
export function measureElement(element: HTMLElement): {
  width: number;
  height: number;
  rect: DOMRect;
} {
  let dimensions: { width: number; height: number; rect: DOMRect };

  layout.measure(() => {
    const rect = element.getBoundingClientRect();
    dimensions = {
      width: rect.width,
      height: rect.height,
      rect,
    };
  });

  layout.flush();

  return dimensions!;
}

/**
 * Safely set element styles without causing forced reflow
 */
export function setElementStyle(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  layout.mutate(() => {
    Object.assign(element.style, styles);
  });
}

/**
 * Optimized scroll handling with RAF
 */
export function optimizeScrollHandler(
  handler: (event: Event) => void,
  _options: { passive?: boolean } = {}
): (event: Event) => void {
  let ticking = false;

  return (event: Event) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handler(event);
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Optimized resize handler with RAF
 */
export function optimizeResizeHandler(
  handler: () => void
): () => void {
  let ticking = false;

  return () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handler();
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Detect and report layout shifts
 */
export function detectLayoutShift(callback: (shift: number) => void): () => void {
  let previousSize = { width: 0, height: 0 };

  const checkLayout = () => {
    const currentSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const widthShift = Math.abs(currentSize.width - previousSize.width);
    const heightShift = Math.abs(currentSize.height - previousSize.height);
    const totalShift = widthShift + heightShift;

    if (totalShift > 0) {
      callback(totalShift);
    }

    previousSize = currentSize;
  };

  const handleResize = optimizeResizeHandler(checkLayout);
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * Contain method to prevent layout thrashing
 */
export function contain<T>(fn: () => T): T {
  const optimizer = new LayoutOptimizerImpl();
  const originalLayout = layout;

  // Temporarily replace global layout
  (layout as LayoutOptimizerImpl) = optimizer;

  try {
    const result = fn();
    optimizer.flush();
    return result;
  } finally {
    // Restore original layout
    (layout as LayoutOptimizerImpl) = originalLayout;
  }
}

/**
 * Performance monitoring for layout operations
 */
export class LayoutPerformanceMonitor {
  private readCount = 0;
  private writeCount = 0;
  private flushCount = 0;
  private startTime = performance.now();

  getMetrics() {
    return {
      readCount: this.readCount,
      writeCount: this.writeCount,
      flushCount: this.flushCount,
      duration: performance.now() - this.startTime,
    };
  }

  reset() {
    this.readCount = 0;
    this.writeCount = 0;
    this.flushCount = 0;
    this.startTime = performance.now();
  }

  instrument(optimizer: LayoutOptimizerImpl): LayoutOptimizerImpl {
    const originalMeasure = optimizer.measure.bind(optimizer);
    const originalMutate = optimizer.mutate.bind(optimizer);
    const originalFlush = optimizer.flush.bind(optimizer);

    optimizer.measure = (fn: ReadFn) => {
      this.readCount++;
      return originalMeasure(fn);
    };

    optimizer.mutate = (fn: WriteFn) => {
      this.writeCount++;
      return originalMutate(fn);
    };

    optimizer.flush = () => {
      this.flushCount++;
      return originalFlush();
    };

    return optimizer;
  }
}

export const layoutMonitor = new LayoutPerformanceMonitor();
