'use client';

import { createDynamicComponent } from '@/lib/dynamic-component';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { Project } from '@hexastudio/types';

interface LazyProjectSceneWrapperProps {
  project: Project;
}

export const LazyProjectSceneWrapper = createDynamicComponent<LazyProjectSceneWrapperProps>(
  () =>
    import('./ProjectSceneWrapper').then((mod) => ({
      default: mod.ProjectSceneWrapper,
    })),
  {
    ssr: false,
    loading: <LoadingScreen />,
  },
);
