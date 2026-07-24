import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { fetchProject, fetchProjects } from '@/features/portfolio/lib/fetchProjects';
import { ProjectScrollCinema } from '@/features/portfolio/components/ProjectScrollCinema';
import { sanitizeJsonLd } from '@/lib/jsonld';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // ISR + on-demand via /api/revalidate (P9)
export const dynamicParams = true; // lazy ISR for unknown slugs

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);
  return {
    title: `${project?.title ?? 'Project'} | HexaStudio`,
    description: project?.description ?? 'Architectural visualization project by HexaStudio',
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Project not found.</p>
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine the next project in the list for the "05 NEXT" chapter.
  let nextProject: typeof project | null = null;
  try {
    const allProjects = await fetchProjects();
    const idx = (allProjects.projects ?? []).findIndex((p) => p.slug === slug);
    if (idx !== -1) {
      const nextIdx = (idx + 1) % (allProjects.projects?.length ?? 1);
      nextProject = allProjects.projects[nextIdx] ?? null;
      // Don't link to the same project if there's only one.
      if (nextProject?.slug === slug) nextProject = null;
    }
  } catch {
    // Non-critical — just don't show the next project card.
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.coverImage,
    author: {
      '@type': 'Organization',
      name: 'HexaStudio',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />

      {/* Scroll Cinema: 5-chapter cinematic case study */}
      <ProjectScrollCinema project={project} nextProject={nextProject} />
    </div>
  );
}
