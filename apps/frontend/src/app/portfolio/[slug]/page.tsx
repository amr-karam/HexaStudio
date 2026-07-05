'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProject } from '@/features/portfolio/hooks/useProjects';
import { ExperienceCanvas } from '@/features/scene/components/ExperienceCanvas';
import { SceneErrorBoundary } from '@/features/scene/components/SceneErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError } = useProject(slug);

  if (isLoading) return <LoadingScreen />;
  if (isError || !project) return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-light mb-4">Project Not Found</h1>
        <Link href="/portfolio">
          <Button variant="outline">Return to Portfolio</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      {/* 3D Immersive Experience */}
      <SceneErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <ExperienceCanvas 
            projectModelUrl={project.modelUrl} 
            hotspots={project.hotspots} 
          />
        </Suspense>
      </SceneErrorBoundary>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

      {/* Project Info Interface */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-8 md:p-16 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <Link 
            href="/portfolio" 
            className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-neutral-500 hover:text-accent transition-colors duration-500"
          >
            <span className="h-[1px] w-8 bg-neutral-700 group-hover:bg-accent transition-all duration-500" />
            Back to Portfolio
          </Link>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
              {project.category?.name}
            </span>
          </div>
        </div>

        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'var(--ease-out-expo)', delay: 0.5 }}
            className="pointer-events-auto"
          >
            <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground mb-6 leading-tight">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl font-light text-neutral-400 leading-relaxed mb-12 max-w-xl">
              {project.description}
            </p>
            <div className="flex gap-6">
              <Button variant="primary" size="lg">
                View Technical Specs
              </Button>
              <Button variant="outline" size="lg">
                Contact for Inquiry
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Camera Instructions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 right-8 z-10 text-right pointer-events-none"
      >
        <p className="text-[10px] uppercase tracking-widest text-neutral-600">
          Interact to Explore
        </p>
        <p className="text-[9px] uppercase tracking-widest text-neutral-700">
          Drag to Rotate • Scroll to Zoom
        </p>
      </motion.div>
    </main>
  );
}
