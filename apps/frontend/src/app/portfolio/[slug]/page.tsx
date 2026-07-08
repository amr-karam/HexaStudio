import type { Metadata } from 'next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { TextReveal } from '@/components/ui/TextReveal';
import { Button } from '@/components/ui/Button';
import { projectsService } from '@/services/projects.service';

interface ProjectPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = params;
  const project = await projectsService.getProjectBySlug(slug);
  return {
    title: `${project?.title} | HexaStudio`,
    description: project?.description || 'Architectural visualization project by HexaStudio',
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsService.getProjectBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 1.5 }} 
          className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
        >
          Loading Project...
        </motion.div>
      </div>
    );
  }

  if (isError || !project) {
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
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image 
            src={project.image} 
            alt={project.title} 
            fill 
            priority 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        </motion.div>

        <div className="relative h-full flex flex-col justify-end p-8 md:p-16 pb-24">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xs uppercase tracking-[0.5em] text-accent mb-6 block font-mono"
          >
            {project.category}
          </motion.span>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground leading-tight"
          >
            <TextReveal delay={0.2}>
              {project.title}
            </TextReveal>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xl md:text-2xl text-neutral-400 font-light leading-relaxed"
            >
              <p>
                {project.description || `This project exemplifies the intersection of organic architecture and futuristic luxury. Our approach focused on capturing the ethereal quality of natural light within a structured, minimalist environment, ensuring a seamless transition between indoor and outdoor spaces.`}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  className="relative aspect-[4/5] bg-neutral-900 overflow-hidden rounded-sm border border-border/30"
                >
                  <Image 
                    src={`/images/projects/${project.slug}-detail-${i}.jpg`} 
                    alt={`${project.title} detail ${i}`} 
                    fill 
                    className="object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = project.image;
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="py-24 border-t border-border/30 text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-light text-foreground">Explore More</h2>
          <Link href="/portfolio">
            <Button variant="outline" size="lg" className="text-xs uppercase tracking-widest">
              Back to Portfolio
            </Button>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
