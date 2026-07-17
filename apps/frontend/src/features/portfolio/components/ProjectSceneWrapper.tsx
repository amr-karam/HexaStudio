'use client';

import React, { Suspense } from 'react';
import { ExperienceCanvas } from '@/features/scene/components/ExperienceCanvas';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { Project } from '@hexastudio/types';

interface ProjectSceneWrapperProps {
  project: Project;
}

/**
 * ProjectSceneWrapper integrates the 3D experience into the project detail page.
 * It provides an error boundary and loading state for the complex 3D scene.
 */
export const ProjectSceneWrapper = ({ project }: ProjectSceneWrapperProps) => {
  return (
    <SceneErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <ExperienceCanvas 
          projectModelUrl={project.modelUrl} 
          hotspots={project.hotspots} 
          projectTitle={project.title}
          status={project.status}
          milestones={project.milestones}
        />
      </Suspense>
    </SceneErrorBoundary>
  );
};
