/**
 * Performance Budgets — HEXA STUDIO
 *
 * These budgets are enforced in CI via Lighthouse CI.
 * Budgets are set for the /story page (the most performance-critical).
 *
 * All values are in milliseconds unless noted.
 */
export const PERFORMANCE_BUDGETS = {
  /** Largest Contentful Paint — target < 2.5s on 4G */
  lcp: 2500,
  /** First Input Delay — target < 100ms */
  fid: 100,
  /** Cumulative Layout Shift — target < 0.1 */
  cls: 0.1,
  /** Total Blocking Time — target < 200ms */
  tbt: 200,
  /** Interaction to Next Paint — target < 200ms */
  inp: 200,
  /** Time to First Byte — target < 600ms */
  ttfb: 600,
  /** First Contentful Paint — target < 1.8s */
  fcp: 1800,
  /** Speed Index — target < 3.4s */
  speedIndex: 3400,
  /** Total page weight — target < 1.5MB */
  totalWeight: 1500000,
  /** JavaScript bundle size — target < 500KB */
  jsBundle: 500000,
  /** 3D scene frame time — target < 16.6ms (60fps) */
  frameTime: 16.6,
  /** 3D scene draw calls — target < 500 */
  drawCalls: 500,
  /** 3D scene triangle count — target < 1M */
  triangles: 1000000,
} as const;

export type PerformanceBudgetKey = keyof typeof PERFORMANCE_BUDGETS;
