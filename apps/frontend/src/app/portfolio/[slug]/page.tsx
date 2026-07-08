import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { fetchProject } from '@/features/portfolio/lib/fetchProjects';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

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

  return (
    <main className="min-h-screen bg-background">
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        </div>
        <div className="relative h-full flex flex-col justify-end p-8 md:p-16 pb-24">
          <span className="text-xs uppercase tracking-[0.5em] text-accent mb-6 block font-mono">
            {project.category}
          </span>
          <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground leading-tight">
            {project.title}
          </h1>
        </div>
      </section>

      <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-surface border border-border/50 p-8 rounded-sm">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6 font-mono">Project Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Client</p>
                  <p className="text-sm text-foreground font-light">Confidential Luxury Estate</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Year</p>
                  <p className="text-sm text-foreground font-light">2026</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-600 mb-1">Services</p>
                  <p className="text-sm text-foreground font-light">3D Visualization, Interior Design, Lighting Study</p>
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

      <section className="py-24 border-t border-border/30 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-5xl font-serif font-light text-foreground">Explore More</h2>
          <Link href="/portfolio">
            <Button variant="outline" size="lg" className="text-xs uppercase tracking-widest">
              Back to Portfolio
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
