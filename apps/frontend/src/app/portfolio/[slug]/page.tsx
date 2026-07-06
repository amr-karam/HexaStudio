import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { fetchProject } from '@/features/portfolio/lib/fetchProjects';
import { LazySceneCanvas, SceneErrorBoundary } from '@/features/scene';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { ProjectStructuredData } from '@/components/ProjectStructuredData';
import Link from 'next/link';
import { Project } from '@hexastudio/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    return {
      title: 'Project Not Found | HexaStudio',
    };
  }

  const baseUrl = 'https://hexastudio.net';
  const imageUrl = project.coverImage ? `${project.coverImage}?w=1200&q=80` : `${baseUrl}/logo.webp`;

  return {
    title: `${project.title} | HexaStudio`,
    description: project.shortDescription || project.description,
    openGraph: {
      title: project.title,
      description: project.shortDescription || project.description,
      url: `${baseUrl}/portfolio/${project.slug}`,
      siteName: 'HexaStudio',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.shortDescription || project.description,
      images: [imageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <ProjectStructuredData project={project} />
      <ProjectContent project={project} />
    </>
  );
}

function ProjectContent({ project }: { project: Project }) {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <SceneErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <LazySceneCanvas 
            projectModelUrl={project.modelUrl} 
            hotspots={project.hotspots}
            projectTitle={project.title}
          />
        </Suspense>
      </SceneErrorBoundary>

      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

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
