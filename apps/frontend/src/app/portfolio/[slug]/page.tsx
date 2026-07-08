import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { fetchProject, fetchProjects } from '@/features/portfolio/lib/fetchProjects';
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

const fallbackProjects: Record<string, Partial<Project>> = {
  'obsidian-villa': {
    id: 'fallback-1',
    title: 'The Obsidian Villa',
    slug: 'obsidian-villa',
    description: 'A minimalist residential masterpiece carved into a volcanic hillside, where raw black stone meets floor-to-ceiling glass.',
    shortDescription: 'Minimalist residential carved into volcanic hillside.',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    category: { id: 'cat-1', name: 'Residential', slug: 'residential' },
    hotspots: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'lumina-pavilion': {
    id: 'fallback-2',
    title: 'Lumina Pavilion',
    slug: 'lumina-pavilion',
    description: 'A translucent commercial pavilion that appears to float above its waterfront site. ETFE cushions and precision steel form a crystalline envelope.',
    shortDescription: 'Translucent waterfront commercial pavilion.',
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    category: { id: 'cat-2', name: 'Commercial', slug: 'commercial' },
    hotspots: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'azure-heights': {
    id: 'fallback-3',
    title: 'Azure Heights',
    slug: 'azure-heights',
    description: 'A vertical garden tower where every residence opens to sky terraces with cascading greenery. The facade breathes with solar exposure.',
    shortDescription: 'Vertical garden tower with sky terraces.',
    coverImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
    category: { id: 'cat-3', name: 'Residential', slug: 'residential' },
    hotspots: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'zenith-office': {
    id: 'fallback-4',
    title: 'Zenith Office',
    slug: 'zenith-office',
    description: 'A reimagined workplace where biophilic design meets cutting-edge technology. Triple-height atriums and living walls create an evolving environment.',
    shortDescription: 'Biophilic workplace with cutting-edge technology.',
    coverImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
    category: { id: 'cat-4', name: 'Commercial', slug: 'commercial' },
    hotspots: [],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const projectsData = await fetchProjects();
    const apiSlugs = (projectsData.projects ?? []).map((project) => ({ slug: project.slug }));
    const fallbackSlugs = Object.keys(fallbackProjects).map((slug) => ({ slug }));
    return [...apiSlugs, ...fallbackSlugs];
  } catch {
    return Object.keys(fallbackProjects).map((slug) => ({ slug }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);
  const fallback = fallbackProjects[slug];
  const data = project ?? fallback;

  if (!data) {
    return { title: 'Project Not Found | HexaStudio' };
  }

  const baseUrl = 'https://hexastudio.net';
  const imageUrl = data.coverImage ? `${data.coverImage}?w=1200&q=80` : `${baseUrl}/logo.svg`;

  return {
    title: `${data.title} | HexaStudio`,
    description: data.shortDescription || data.description,
    openGraph: {
      title: data.title,
      description: data.shortDescription || data.description,
      url: `${baseUrl}/portfolio/${data.slug}`,
      siteName: 'HexaStudio',
      locale: 'en_US',
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.shortDescription || data.description,
      images: [imageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await fetchProject(slug);
  const fallback = fallbackProjects[slug];
  const data = project ?? fallback;

  if (!data) {
    notFound();
  }

  return (
    <>
      <ProjectStructuredData project={data as Project} />
      <ProjectContent project={data as Project} />
    </>
  );
}

const descriptions: Record<string, string> = {
  'obsidian-villa': 'A minimalist residential masterpiece carved into a volcanic hillside, where raw black stone meets floor-to-ceiling glass. The interplay of shadow and light creates an ever-changing atmosphere across every surface.',
  'lumina-pavilion': 'A translucent commercial pavilion that appears to float above its waterfront site. ETFE cushions and precision steel form a crystalline envelope that refracts sunlight throughout the day.',
  'azure-heights': 'A vertical garden tower in the heart of the city, where every residence opens to sky terraces with cascading greenery. The facade breathes — opening and closing in response to solar exposure.',
  'zenith-office': 'A reimagined workplace where biophilic design meets cutting-edge technology. Triple-height atriums, living walls, and adaptive lighting create an environment that evolves with its occupants.',
};

function ProjectContent({ project }: { project: Project }) {
  const desc = descriptions[project.slug] || project.description;

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
            className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] text-neutral-500 hover:text-accent transition-colors duration-500"
          >
            <span className="h-[1px] w-8 bg-neutral-700 group-hover:bg-accent transition-all duration-500" />
            Back to Portfolio
          </Link>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">
              {project.category?.name}
            </span>
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="pointer-events-auto"
          >
            <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground mb-6 leading-tight">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl font-light text-neutral-400 leading-relaxed mb-12">
              {desc}
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
        <p className="text-[11px] uppercase tracking-widest text-neutral-600">
          Interact to Explore
        </p>
        <p className="text-[9px] uppercase tracking-widest text-neutral-700">
          Drag to Rotate • Scroll to Zoom
        </p>
      </motion.div>
    </main>
  );
}
