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
export const dynamic = 'force-dynamic';
export const dynamicParams = true; // lazy ISR for unknown slugs

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProject(slug);
  const url = `https://hexastudio.net/projects/${slug}`;

  return {
    title: project?.title ?? 'Project',
    description: project?.description ?? 'Architectural visualization project by HexaStudio',
    alternates: { canonical: url },
    openGraph: {
      title: project?.title ?? 'Project',
      description: project?.description ?? 'Architectural visualization project by HexaStudio',
      url,
      siteName: 'HexaStudio',
      type: 'website',
      images: project?.coverImage
        ? [
            {
              url: `${project.coverImage}?w=1200&q=80`,
              width: 1200,
              height: 630,
              alt: project?.title ?? 'HexaStudio project',
            },
          ]
        : [
            {
              url: 'https://hexastudio.net/logo.svg',
              width: 1200,
              height: 630,
              alt: 'HexaStudio',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project?.title ?? 'Project',
      description: project?.description ?? 'Architectural visualization project by HexaStudio',
      images: project?.coverImage
        ? [`${project.coverImage}?w=1200&q=80`]
        : ['https://hexastudio.net/logo.svg'],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-sl-void flex items-center justify-center">
        <div className="text-center">
          <p className="text-sl-mist/60 mb-4">Project not found.</p>
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
    <div className="min-h-screen bg-sl-void">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />

      {/* Scroll Cinema: 5-chapter cinematic case study */}
      <ProjectScrollCinema project={project} nextProject={nextProject} />
    </div>
  );
}
