'use client';

import { motion } from 'framer-motion';
import { EASE, DURATION, STAGGER, fadeLift, staggerContainer, textReveal } from '@/lib/motion';

interface CraftChapterProps {
  className?: string;
}

/**
 * CraftChapter — Chapter 02: The Process
 *
 * Scroll-revealed chapter showing the studio's technical process.
 * Uses staggered text reveals and interactive step cards.
 */
export function CraftChapter({ className }: CraftChapterProps) {
  const steps = [
    {
      number: '01',
      title: 'Brief & Light Study',
      body: 'Site coordinates, orientation, climate data. We model the sun path for every day of the year before a single polygon exists.',
      detail: 'Heliodon analysis · Climate consulting · Shadow mapping',
    },
    {
      number: '02',
      title: 'White Model & Composition',
      body: 'Massing studies in neutral clay. Camera angles locked. Composition refined until the frame tells the story without materials.',
      detail: 'Cinematic framing · Aspect ratio tests · Focal length studies',
    },
    {
      number: '03',
      title: 'Material Authoring',
      body: 'Measured PBR pipelines. Physical samples scanned. Subsurface scattering for stone, thin-film for glass, fuzz for textiles.',
      detail: 'Measured reflectance · Spectral data · Aging simulation',
    },
    {
      number: '04',
      title: 'Atmosphere & Camera',
      body: 'Volumetrics, lens effects, color grading. The virtual camera matches a real cinema prime — 35mm, 50mm, 85mm equivalents.',
      detail: 'Volumetric fog · Chromatic aberration · Film grain · LUT grading',
    },
    {
      number: '05',
      title: 'Render & Review',
      body: 'Path-traced at 8K. Frame-by-frame QA. Client review in color-managed viewport. Final delivery in multiple color spaces.',
      detail: 'Path tracing · 8K output · ACES workflow · Multi-format delivery',
    },
  ];

  return (
    <section
      id="craft"
      className={`relative bg-sl-obsidian px-6 py-32 sm:px-10 md:px-16 md:py-48 ${className || ''}`}
    >
      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: DURATION.component, ease: EASE.entrance }}
          className="font-mono text-[10px] uppercase tracking-[0.5em] text-sl-gold-subtle/70"
        >
          <span className="mr-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
          Ch. 02 — Craft
          <span className="ml-3 inline-block h-px w-8 align-middle bg-sl-gold-subtle/50" />
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={staggerContainer(STAGGER.component, 0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-12"
        >
          <motion.h2
            variants={textReveal}
            className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[0.95] tracking-[-0.02em] text-sl-alabaster"
          >
            Precision is not a style. <br />
            <span className="italic text-sl-gold-hover">It is the only language</span> <br />
            light understands.
          </motion.h2>

          <motion.p
            variants={fadeLift}
            className="mt-10 max-w-2xl text-base font-light leading-relaxed text-sl-mist/60"
          >
            Twenty-two projects. Zero compromises on physics. Our pipeline is built on measured data,
            spectral accuracy, and a refusal to fake what light does naturally.
          </motion.p>
        </motion.div>

        {/* Process timeline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-20 relative"
        >
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-sl-gold-subtle/30 via-transparent to-sl-gold-subtle/30 md:left-[120px]" aria-hidden="true" />

          <div className="space-y-16 md:pl-32">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeLift}
                className="relative flex gap-8"
              >
                {/* Step marker */}
                <div className="relative flex-shrink-0 w-16 h-16 md:w-24 md:h-24" aria-hidden="true">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-sl-obsidian border-2 border-sl-gold-subtle/50 group-hover:border-sl-gold-hover transition-colors duration-500" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] text-sl-gold-subtle/70">{step.number}</div>
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0 group">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: DURATION.component, delay: i * 0.1, ease: EASE.entrance }}
                    className="pt-2"
                  >
                    <h3 className="font-serif text-xl font-medium tracking-[-0.01em] text-sl-alabaster group-hover:text-sl-gold-hover transition-colors duration-500">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-sl-mist/60">{step.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.detail.split(' · ').map((tag, ti) => (
                        <span
                          key={ti}
                          className="px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-sl-mist/50 bg-sl-gold-subtle/5 rounded-full border border-sl-gold-subtle/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/30 to-transparent" />
    </section>
  );
}