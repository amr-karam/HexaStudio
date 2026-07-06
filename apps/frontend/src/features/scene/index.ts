import { createDynamicComponent } from '@/lib/dynamic-component';

export const LazySceneCanvas = createDynamicComponent(
  () => import('./components/SceneCanvas'),
  { ssr: false },
);

export { SceneErrorBoundary } from './components/SceneErrorBoundary';

export type { SceneViewState } from '@/types';
