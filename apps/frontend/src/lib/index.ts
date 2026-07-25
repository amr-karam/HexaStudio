/**
 * Library utilities export
 */

// Auth-aware API client (refresh token rotation)
export {
  authFetch,
  authenticatedFetch,
  setRefreshToken,
  getRefreshToken,
  onAuthLogout,
} from './api-client';

// Task scheduling utilities
export {
  scheduleTask,
  scheduleIdleTask,
  processInChunks,
  runWithYielding,
  TaskQueue,
  taskQueue,
  debounce,
  throttle,
  measureTask,
} from './task-scheduler';

// Layout optimization utilities
export {
  layout,
  useLayoutOptimization,
  batchLayoutOperations,
  measureElement,
  setElementStyle,
  optimizeScrollHandler,
  optimizeResizeHandler,
  detectLayoutShift,
  contain,
  LayoutPerformanceMonitor,
  layoutMonitor,
} from './layout-optimizer';

// Idle utility
export { onIdle } from './idle';
