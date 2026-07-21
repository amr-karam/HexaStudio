import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPage } from '@/features/pages/lib/fetchPages';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';
import { Button } from '@/components/ui/Button';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { TeamSection } from '@/features/team/components/TeamSection';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const FALLBACK_DESCRIPTION =
  'We are a multidisciplinary studio specializing in the intersection of architecture and digital art. Our mission is to create photorealistic environments that transcend traditional rendering.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('about');

  if (!page) {
    return {
      title: 'About | HexaStudio',
      description: FALLBACK_DESCRIPTION,
    };
  }

  return {
    title: page.seoTitle || `${page.title} | HexaStudio`,
    description: page.seoDescription || page.excerpt || FALLBACK_DESCRIPTION,
  };
}

export default async function AboutPage() {
  const page = await fetchPage('about');
  const hasCmsContent = Boolean(page?.content?.length);
  const heroImage = page?.featuredImage?.url;

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-20 overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        {heroImage && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}
        <div className="text-center relative z-10">
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-8 block font-mono">
            The Studio
          </span>
          <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground mb-12 leading-[0.9]">
            <TextCharReveal
              text={page?.title || 'Vision'}
              as="span"
              delay={0.1}
              stagger={0.05}
              blur
              className="block"
            />
            {!page?.title && (
              <span className="italic text-accent">
                <TextCharReveal text="Realized." as="span" delay={0.4} stagger={0.04} blur />
              </span>
            )}
          </h1>
          <p className="text-neutral-400 text-lg font-light w-full max-w-4xl mx-auto leading-relaxed">
            {page?.excerpt || FALLBACK_DESCRIPTION}
          </p>
        </div>
      </section>

      {/* CMS content — or the philosophy fallback when the CMS has no page yet */}
      {hasCmsContent ? (
        <section className="px-8 md:px-16 py-32 bg-surface border-y border-border/50">
          <div className="w-full max-w-4xl mx-auto prose prose-invert prose-headings:font-serif prose-headings:font-light prose-a:text-accent">
            <StrapiBlocks content={page!.content} />
          </div>
        </section>
      ) : (
        <section className="px-8 md:px-16 py-32 bg-surface border-y border-border/50">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="relative aspect-square overflow-hidden bg-surface-light border border-border/30 group">
                <div className="h-full w-full relative">
                  <Image
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80"
                    alt="Studio Space"
                    fill
                    className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                </div>
                <div className="absolute inset-0 border-[30px] border-background/20 pointer-events-none group-hover:border-background/10 transition-all duration-700" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.5em] text-accent mb-6 block font-mono">
                  Our Philosophy
                </span>
                <h2 className="text-4xl md:text-6xl font-serif font-light text-foreground mb-8 leading-tight">
                  Precision in <br />
                  Every Detail.
                </h2>
                <p className="text-neutral-400 font-light text-lg leading-relaxed mb-12">
                  We believe that the difference between a good render and a masterpiece lies in the
                  details. From the way light hits a brushed metal surface to the subtle imperfection
                  of a concrete wall, we obsess over the physics of reality to create believable
                  digital worlds.
                </p>
                <Link href="/contact">
                  <Button variant="primary" size="lg">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <TeamSection />

      {/* CTA */}
      <section className="px-8 md:px-16 py-32 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="w-full text-center relative z-10">
          <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono">
            Work With Us
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground mb-8 leading-tight">
            Ready to <span className="italic text-accent">Collaborate?</span>
          </h2>
          <p className="text-neutral-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            We partner with architects, developers, and visionaries worldwide. Let&apos;s create
            something extraordinary together.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="group">
              Start a Conversation
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
