import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { fetchProject } from '@/features/portfolio/lib/fetchProjects';
import { LazyProjectSceneWrapper } from '@/features/portfolio/components/LazyProjectSceneWrapper';
import { sanitizeJsonLd } from '@/lib/jsonld';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

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
          <Link href="/portfolio">
            <Button variant="outline">Back to Portfolio</Button>
          </Link>
        </div>
      </div>
    );
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
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />
      {/* Cinematic 3D Header */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-obsidian">
        {project.modelUrl ? (
          <LazyProjectSceneWrapper project={project} />
        ) : (
          <div className="absolute inset-0">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGAExecuteX7pAAAAAElFTkSszYAwAAAABJRU5ErkJggg=="
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian/20 via-transparent to-background" />
          </div>
        )}
        <div className="relative h-full flex flex-col justify-end p-8 md:p-16 pb-24 pointer-events-none">
          <span className="text-xs uppercase tracking-[0.5em] text-accent mb-6 block font-mono">
            {project.category?.name}
          </span>
          <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground leading-tight">
            {project.title}
          </h1>
        </div>
      </section>


      <section className="py-24 px-8 md:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-surface border border-border/50 p-8 rounded-sm">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6 font-mono">Project Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Client</p>
                  <p className="text-sm text-foreground font-light">{project.client ?? 'Confidential'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Year</p>
                  <p className="text-sm text-foreground font-light">{project.year ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Services</p>
                  <p className="text-sm text-foreground font-light">{project.services?.join(', ') ?? 'Architectural Visualization'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Status</p>
                  <p className="text-sm text-accent font-medium">{project.status || 'Completed'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-12">
            <div className="text-xl md:text-2xl text-neutral-400 font-light leading-relaxed">
              <p>
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-border/30">
        <div className="px-8 md:px-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
                Like What You See?
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-foreground mb-6 leading-tight">
                Let&apos;s Create Something <span className="italic text-accent">Extraordinary</span>
              </h2>
              <p className="text-neutral-400 font-light leading-relaxed mb-8 max-w-lg">
                Every project starts with a conversation. Tell us about your vision and we&apos;ll bring it to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button variant="primary" size="lg" className="group">
                    Start a Project
                    <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="outline" size="lg">
                    More Projects
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-px h-48 bg-gradient-to-b from-transparent via-accent/30 to-transparent hidden md:block" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
