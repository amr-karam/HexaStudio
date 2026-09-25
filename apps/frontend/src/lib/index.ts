/**
 * Library utilities export
 */

// Auth-aware API client (cookie-based refresh)
export {
  authFetch,
  authenticatedFetch,
  setLoggedIn,
  isLoggedIn,
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

// v0 component bridge
export {
  V0Components,
  withHEXAMotion,
  V0_TOKEN_BRIDGE,
  isV0Available,
} from './v0'

// evey-design plugin: 5 design tools
export {
  design_token_lookup,
  scaffold_component,
  design_audit,
  motion_variants,
  a11y_check,
} from './evey-design';

// ScrollStory orchestrator
export {
  useScrollStory,
  ScrollStoryProvider,
  useScrollStoryContext,
  useChapterRail,
  useChapterSync,
  createChapterConfig,
} from './scroll-story';
export type {
  ChapterConfig,
  ScrollStoryState,
  ScrollStoryActions,
  ScrollStoryOptions,
  ScrollStoryResult,
} from './scroll-story';
