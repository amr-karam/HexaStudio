import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPage } from '@/features/pages/lib/fetchPages';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';
import { Button } from '@/components/ui/Button';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { TeamSection } from '@/features/team/components/TeamSection';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

import { ClientSilkShaderBackground } from '@/components/effects/ClientSilkShaderBackground';
import { siteTitleSegment } from '@/lib/site-title';
export const revalidate = 3600;

const FALLBACK_DESCRIPTION =
  'We are a multidisciplinary studio specializing in the intersection of architecture and digital art. Our mission is to create photorealistic environments that transcend traditional rendering.';

/* -------------------------------------------------------------------------- */
/*  Movement III — "The Method": pillars of craft (hardcoded studio doctrine)  */
/* -------------------------------------------------------------------------- */

const PILLARS = [
  {
    label: 'Vision',
    numeral: 'Ⅰ',
    body: 'Before geometry, there is intent. We begin by reading the architect\u2019s idea — the life a place will hold — before a single pixel is drawn.',
  },
  {
    label: 'Precision',
    numeral: 'Ⅱ',
    body: 'Materials, shadows, and reflections are measured against the physics of the real world, until an image stops being simulated and starts being true.',
  },
  {
    label: 'Atmosphere',
    numeral: 'Ⅲ',
    body: 'Light is our medium. We compose it the way a cinematographer composes a frame — letting the hour, the weather, and the mood set the exposure.',
  },
  {
    label: 'Fidelity',
    numeral: 'Ⅳ',
    body: 'The finished frame must stand beside a building that does not yet exist, and be mistaken for its photograph. That is our standard.',
  },
] as const;

/* Decorative double-rule ornament (fine-press diamond divider). The
   .storybook-ornament class owns its flex layout and margins, so we center it
   through a flex wrapper rather than utility margins. */
function DiamondOrnament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div aria-hidden="true" className="storybook-ornament w-full max-w-xs">
        <span className="h-1.5 w-1.5 rotate-45 border border-accent/50" />
      </div>
    </div>
  );
}

/* Small mono section marker — "§ 01", "§ 02", etc. */
function SectionMarker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.5em] text-accent/70">
      {children}
    </p>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage('about');

  if (!page) {
    return {
      title: 'About',
      description: FALLBACK_DESCRIPTION,
    };
  }

  return {
    title: page.seoTitle ? siteTitleSegment(page.seoTitle) : page.title,
    description: page.seoDescription || page.excerpt || FALLBACK_DESCRIPTION,
  };
}

export default async function AboutPage() {
  const page = await fetchPage('about');
  const hasCmsContent = Boolean(page?.content?.length);
  const heroImage = page?.featuredImage?.url;

  return (
    <div className="bg-background text-foreground">
      {/* ------------------------------------------------------------------ */}
      {/* Movement I — Frontispiece (title page of the monograph)             */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 pt-20">
        <ClientSilkShaderBackground speed={0.4} opacity={0.18} className="z-0" />
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

        {/* Ghost chapter numeral */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-16 select-none font-serif text-[clamp(7rem,16vw,13rem)] leading-none text-accent/5"
        >
          Ⅰ
        </span>

        <div className="relative z-10 text-center">
          <span className="mb-10 inline-flex items-center justify-center gap-4 font-mono text-xs uppercase tracking-[0.5em] text-neutral-500">
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
            The Studio · Manifesto
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
          </span>

          <h1 className="mb-10 text-6xl font-serif font-light leading-[0.9] tracking-[-0.04em] text-foreground md:text-9xl">
            <TextCharReveal
              text={page?.title ?? 'The Manifesto'}
              as="span"
              delay={0.1}
              stagger={0.05}
              blur
              className="block"
            />
            {!page?.title && (
              <span className="block italic text-accent">
                <TextCharReveal
                  text="of Light"
                  as="span"
                  delay={0.4}
                  stagger={0.04}
                  blur
                />
              </span>
            )}
          </h1>

          {/* Double-rule ornament below the title */}
          <DiamondOrnament className="mb-12" />

          <p className="mx-auto w-full max-w-4xl text-lg font-light leading-relaxed text-neutral-400">
            {page?.excerpt || FALLBACK_DESCRIPTION}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Movement II — The Doctrine (editorial essay, CMS or fallback)       */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="doctrine-title"
        className="relative overflow-hidden border-y border-border/50 bg-surface px-8 py-28 md:px-16 md:py-36"
      >
        <div aria-hidden="true" className="absolute inset-0 gradient-radial-gold pointer-events-none" />
        <span
          aria-hidden="true"
          className="chapter-numeral absolute right-[6%] top-10 select-none"
        >
          Ⅱ
        </span>

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <div className="text-center">
            <SectionMarker>§ 01 — The Doctrine</SectionMarker>

            {hasCmsContent ? (
              <h2 id="doctrine-title" className="sr-only">
                The Doctrine
              </h2>
            ) : (
              <h2 id="doctrine-title" className="storybook-heading mt-6">
                Precision in <span className="storybook-accent">Every Detail</span>
              </h2>
            )}

            <DiamondOrnament className="mt-8" />
          </div>

            {hasCmsContent ? (
              <div className="mt-14 prose prose-invert prose-headings:font-serif prose-headings:font-light prose-a:text-accent">
                <StrapiBlocks content={page?.content ?? []} />
              </div>
            ) : (
              /* Editorial essay — asymmetrical fine-press layout */
              <div className="mt-16 grid gap-12 md:grid-cols-12">
                {/* Main Narrative - shifted to create intentional negative space */}
                <div className="md:col-span-6 lg:col-span-7 space-y-8">
                  <p className="drop-cap storybook-body font-light md:text-justify leading-relaxed text-neutral-300">
                    We believe the distance between a good render and a masterpiece is
                    measured in details — the way light falls across brushed metal, the
                    quiet imperfection of a concrete wall, the patience of a shadow at
                    dusk. We study the physics of reality so that our digital worlds feel
                    inhabited long before they exist.
                  </p>
                  <p className="storybook-body storybook-paragraph font-light md:text-justify leading-relaxed text-neutral-400">
                    The studio was founded on a single conviction: architectural
                    visualization is not illustration, it is a discipline of seeing. Every
                    frame we produce is an argument about how a space should feel at a
                    particular hour, beneath a particular sky, in a particular mood.
                  </p>
                </div>
                
                {/* High-contrast sidecar for the pull-quote */}
                <div className="md:col-span-6 lg:col-span-5 md:pt-24 lg:pt-32">
                  <blockquote className="storybook-accent border-l-2 border-accent/30 pl-8 font-serif text-2xl italic leading-tight md:text-3xl text-foreground">
                    &ldquo;We do not decorate architecture with light. We use light to
                    tell the truth about it.&rdquo;
                  </blockquote>
                  <p className="storybook-body mt-12 font-light md:text-justify text-neutral-500 leading-relaxed">
                    Every commission begins the same way — not with software, but with
                    listening. We read the drawings, study the context, and ask the
                    questions that give a building its atmosphere long before the first
                    pixel is placed.
                  </p>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Movement III — The Method (pillars of craft)                        */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="method-title"
        className="relative overflow-hidden bg-background px-8 py-28 md:px-16 md:py-36"
      >
        <span
          aria-hidden="true"
          className="chapter-numeral absolute right-[6%] top-10 select-none"
        >
          Ⅲ
        </span>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="text-center">
            <SectionMarker>§ 02 — The Method</SectionMarker>
            <h2 id="method-title" className="storybook-heading mt-6">
              The <span className="storybook-accent">Method</span> of Making
            </h2>
            <DiamondOrnament className="mt-8" />
          </div>

          <div className="mt-16 grid auto-rows-fr gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.label}
                className="artisan-glass artisan-specular-top group relative flex h-full flex-col overflow-hidden rounded-2xl p-7 sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100"
                />
                <h3 className="font-mono text-[0.625rem] uppercase tracking-[0.35em] text-accent/60">
                  {pillar.label}
                </h3>
                <span
                  aria-hidden="true"
                  className="mt-6 block font-serif text-6xl font-light leading-none text-accent/25"
                >
                  {pillar.numeral}
                </span>
                <p className="mt-6 font-sans text-sm leading-relaxed text-neutral-400">
                  {pillar.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Movement IV — The Practitioners (team)                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-y border-border/30 bg-surface px-8 py-20 md:px-16">
        <div className="mx-auto w-full max-w-5xl text-center">
          <SectionMarker>§ 03 — The Practitioners</SectionMarker>
          <DiamondOrnament className="mt-8" />
        </div>
      </div>

      <TeamSection />

      {/* ------------------------------------------------------------------ */}
      {/* Movement V — Colophon (closing imprint + CTA)                       */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-labelledby="colophon-title"
        className="relative overflow-hidden border-t border-border/30 bg-surface px-8 py-28 md:px-16 md:py-36"
      >
        <ClientSilkShaderBackground speed={0.3} opacity={0.1} />
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <DiamondOrnament />
          <div className="mt-12">
            <SectionMarker>§ 04 — Colophon</SectionMarker>
          </div>
          <h2 id="colophon-title" className="storybook-heading mt-8">
            Every building begins as an image —{' '}
            <span className="storybook-accent">an intention made visible.</span>
          </h2>
          <p className="storybook-accent mt-8 font-serif text-xl italic leading-relaxed md:text-2xl">
            We exist to make that intention unforgettable.
          </p>
          <p className="mt-10 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-neutral-500">
            Hexa Studio · Dubai · MMXXVI
          </p>
          <DiamondOrnament className="mt-14" />
        </div>

        {/* CTA — the invitation that closes the book */}
        <div className="relative z-10 mt-20">
          <LiquidGlassCard goldAccent className="w-full max-w-4xl mx-auto text-center !p-16">
            <span className="mb-6 block font-mono text-xs uppercase tracking-[0.5em] text-accent/60">
              Work With Us
            </span>
            <h3 className="mb-8 text-4xl font-serif font-light leading-tight tracking-tight text-foreground md:text-6xl">
              Ready to <span className="italic text-accent">Collaborate?</span>
            </h3>
            <p className="mx-auto mb-12 w-full max-w-2xl font-light leading-relaxed text-neutral-400">
              We partner with architects, developers, and visionaries worldwide.
              Let&apos;s create something extraordinary together.
            </p>
            <Link href="/contact">
              <Button variant="primary" size="lg" className="group">
                Start a Conversation
                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Button>
            </Link>
          </LiquidGlassCard>
        </div>
      </section>
    </div>
  );
}
