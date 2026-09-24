'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/Button';

/**
 * HomeSections — The narrative spine of the homepage, rendered lazily below
 * the fold. Each chapter is a self-contained motion block that reveals itself
 * as it scrolls into view, preserving the strict vertical rhythm of the
 * silent-luxury grid.
 */
export function HomeSections() {
  const containerRef = useRef<HTMLElement>(null);
  const craftRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const impactRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative bg-sl-void text-sl-alabaster">
      <ChapterSpacer />

      <ChapterCraft ref={craftRef} />

      <ChapterSpacer />

      <ChapterProcess ref={processRef} />

      <ChapterSpacer />

      <ChapterImpact ref={impactRef} />
    </section>
  );
}

/* --- Chapter Spacer --- */
function ChapterSpacer() {
  return <div className="h-px w-full bg-sl-gold-subtle/5" />;
}

/* --- CH. II — Craft --- */
const CraftVariant = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

function ChapterCraft({ ref }: { ref: React.Ref<HTMLElement> }) {
  const isInView = useInView(ref as React.RefObject<HTMLElement>, { once: true, margin: '-10%' });

  return (
    <motion.section
      ref={ref}
      variants={CraftVariant}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 md:px-16 md:py-32"
      id="craft"
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-5"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-silver">
            CH. 02 / CRAFT
          </span>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-sl-alabaster">
            Rendered, not built.
          </h2>
          <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-sl-mist/70">
            Every HEXA image is a photographic event: scene geometry authored by hand,
            lit with physically plausible sky models, and composited with the same
            restraint we apply to architecture itself.
          </p>
          <div className="mt-8">
            <Link href="/projects" data-cursor="explore">
              <Button variant="outline" size="md" className="min-h-[48px]">
                View the Work
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-7"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-sl-gold-subtle/10 bg-sl-void">
            <div className="absolute inset-0 bg-gradient-to-br from-sl-gold-subtle/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-sl-gold-subtle/20 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-sl-gold-subtle/20 to-transparent" />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* --- CH. III — Process --- */
function ChapterProcess({ ref }: { ref: React.Ref<HTMLElement> }) {
  const isInView = useInView(ref as React.RefObject<HTMLElement>, { once: true, margin: '-10%' });

  const steps = [
    { label: 'Spatial Brief', detail: 'Program, adjacencies, sightlines.' },
    { label: 'Massing Study', detail: 'Proportion, material, orientation.' },
    { label: 'Scene Authoring', detail: 'Light, lens, atmosphere, time of day.' },
    { label: 'Render Passes', detail: '8K beauty, AOVs, denoise control.' },
    { label: 'Retouch & Delivery', detail: 'Color, grain, resolution, format.' },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 md:px-16 md:py-32"
      id="process"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-silver">
        CH. 03 / PROCESS
      </span>
      <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-sl-alabaster">
        Pipeline, not postcard.
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-sm border border-sl-gold-subtle/10 bg-sl-void/60 p-5"
          >
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-sl-gold" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-sl-mist/80">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-3 text-sm font-light text-sl-alabaster">{step.label}</p>
            <p className="mt-1 text-xs font-light text-sl-mist/60">{step.detail}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* --- CH. IV — Impact --- */
function ChapterImpact({ ref }: { ref: React.Ref<HTMLElement> }) {
  const isInView = useInView(ref as React.RefObject<HTMLElement>, { once: true, margin: '-10%' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 md:px-16 md:py-32"
      id="impact"
    >
      <div className="relative rounded-sm border border-sl-gold-subtle/10 bg-sl-void/60 p-8 md:p-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-sl-gold-subtle/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-sl-gold-subtle/20 to-transparent" />

        <div className="md:flex md:items-center md:justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-sl-silver">
              CH. 04 / IMPACT
            </span>
            <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-sl-alabaster">
              Begin a project.
            </h2>
            <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-sl-mist/70">
              If you are designing something that does not yet exist, we should speak.
              Tell us the space, the light, and the moment you want to render.
            </p>
          </div>

          <div className="mt-8 md:mt-0">
            <Link href="/contact" data-cursor="explore">
              <Button variant="primary" size="lg" className="min-h-[52px] min-w-[200px]">
                Begin a project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
