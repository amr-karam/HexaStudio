'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { useLocale } from '@/i18n/LocaleProvider';
import type { Service } from '@hexastudio/types';

const FALLBACK_SERVICES: Service[] = [
  {
    id: 'fallback-1',
    title: 'Architectural Exterior Rendering',
    slug: 'exterior-rendering',
    description: 'Photorealistic exterior visual simulation capturing light physics, atmospheric depth, and material nuances across all weather conditions and times of day.',
    features: ['4K & 8K Resolution Still Imagery', 'Physically-Based Lighting & Atmosphere', 'Landscape & Context Integration', 'Day-to-Night Transition Studies'],
    order: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    title: 'Interior Spatial Experience',
    slug: 'interior-experience',
    description: 'Immersive interior visualization showcasing tactile material textures, bespoke furniture compositions, and subtle acoustic/lighting ambiance.',
    features: ['Custom PBR Shader Creation', 'Bespoke Furniture & Prop Modeling', 'Natural & Artificial Light Orchestration', 'Material Specular & Displacement Mapping'],
    order: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    title: '4K Architectural Cinema & Motion',
    slug: 'architectural-cinema',
    description: 'Cinematic film walkthroughs with choreographed camera movement, atmospheric depth, and photorealistic motion blur.',
    features: ['Choreographed GSAP & Camera Timelines', '4K 60FPS Video Rendering', 'Depth of Field & Anamorphic Lens Effects', 'Color Grading & Sound Design'],
    order: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    title: 'WebXR & Real-Time Interactive Tours',
    slug: 'webxr-tours',
    description: 'Browser-native 3D exploration allowing clients and stakeholders to step inside spaces, swap materials, and evaluate spatial flow in real time.',
    features: ['React Three Fiber & WebGL Canvas', 'Interactive Material & Lighting Swapping', 'Multi-User VR Co-Review Rooms', '60 FPS Mobile & Desktop Optimization'],
    order: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    title: 'Masterplanning & Urban Visualization',
    slug: 'masterplanning',
    description: 'Large-scale urban development visualizations illustrating spatial relationships, pedestrian flow, environmental context, and masterplan vision.',
    features: ['City-Scale Context Modeling', 'Solar Exposure & Shadow Impact Studies', 'Pedestrian & Traffic Flow Animations', 'Phasing & Construction Sequence Renders'],
    order: 5,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-6',
    title: 'AI Spatial Synthesis & Prototyping',
    slug: 'ai-spatial-synthesis',
    description: 'Generative AI-assisted concept exploration, rapid material variations, and automated lighting preset generation for preliminary design reviews.',
    features: ['GPT & Neural Concept Iteration', 'Automated Mood & Lighting Preset Generation', 'Semantic Style Transfer on 3D Passes', 'Predictive Aesthetic Analytics'],
    order: 6,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SilkShaderBackground = dynamic(
  () => import('@/components/effects/SilkShaderBackground'),
  { ssr: false },
);

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

interface ServicesPageContentProps {
  services: Service[];
}

/** Ambient gradient per service — subtle atmospheric depth behind each card. */
function ServiceAtmosphere({ index }: { index: number }) {
  const gradients = [
    'radial-gradient(ellipse at 30% 20%, rgba(var(--color-gold-rgb), 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(var(--color-gold-rgb), 0.03) 0%, transparent 50%)',
    'radial-gradient(ellipse at 70% 30%, rgba(var(--color-gold-rgb), 0.05) 0%, transparent 50%), radial-gradient(ellipse at 20% 70%, rgba(255,255,255,0.015) 0%, transparent 50%)',
    'radial-gradient(ellipse at 50% 10%, rgba(var(--color-gold-rgb), 0.07) 0%, transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(var(--color-gold-rgb), 0.02) 0%, transparent 50%)',
    'radial-gradient(ellipse at 20% 60%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 50%), radial-gradient(ellipse at 90% 20%, rgba(255,255,255,0.02) 0%, transparent 50%)',
    'radial-gradient(ellipse at 60% 40%, rgba(var(--color-gold-rgb), 0.05) 0%, transparent 50%), radial-gradient(ellipse at 10% 80%, rgba(var(--color-gold-rgb), 0.025) 0%, transparent 50%)',
    'radial-gradient(ellipse at 40% 70%, rgba(var(--color-gold-rgb), 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(255,255,255,0.015) 0%, transparent 50%)',
  ];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ background: gradients[index % gradients.length] }}
    />
  );
}

/** Service index badge — refined mono label with gold accent. */
function ServiceIndex({ index, title }: { index: number; title: string }) {
  const numeral = String(index + 1).padStart(2, '0');
  return (
    <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500 mb-5 block">
      <span className="text-accent">{numeral}</span>
      {' — '}
      {title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 12)}
    </span>
  );
}

/** Feature list with staggered entrance and gold dot indicators. */
function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-3">
      {features.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.06 * i }}
          className="flex items-start gap-3 text-sm text-neutral-400 font-light leading-relaxed group/item"
        >
          <span className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0 transition-colors duration-500 group-hover/item:bg-accent-bright" />
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

export function ServicesPageContent({ services }: ServicesPageContentProps) {
  const { t } = useLocale();
  const displayServices = services.length > 0 ? services : FALLBACK_SERVICES;

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-20 pb-32 overflow-hidden">
        {/* Atmospheric depth layers */}
        <SilkShaderBackground speed={0.2} opacity={0.08} />
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 40%)',
        }} />

        {/* Ambient floating light orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-[15%] left-[20%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[20%] right-[15%] w-[25%] h-[25%] rounded-full bg-accent/3 blur-[100px]" style={{ animationDelay: '-3s' }} />
        </div>

        {/* Typography */}
        <div className="text-center relative z-10 mb-32 md:mb-40">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="font-mono text-[9px] uppercase tracking-[0.5em] text-neutral-500 mb-8 block"
          >
            {t('services.expertise')}
          </motion.span>
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light tracking-tighter text-foreground leading-[0.92] mb-8">
            <TextCharReveal
              text={String(t('services.title')) || 'Our Services.'}
              as="h1"
              delay={0.12}
              stagger={0.025}
              blur
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.25 }}
            className="text-neutral-400 font-light text-base md:text-lg leading-relaxed max-w-xl mx-auto px-4"
          >
            {t('services.tagline') || 'From first sketch to final render — every service shaped by precision and light.'}
          </motion.p>
        </div>

        {/* Scroll affordance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-600">
            Scroll to explore
          </span>
          <div className="w-px h-6 bg-gradient-to-b from-accent/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── SERVICES GRID ──────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 pb-32 relative">
        {/* Section atmosphere */}
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

        <div className="relative z-10">
          {/* Grid: 2 rows of 3, cinematic stagger choreography */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {displayServices.map((service, idx) => {
              const title = service.title;
              const description = service.description;
              const features = service.features;

              return (
                <motion.div
                  key={service.id || title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 24,
                    delay: 0.08 * idx,
                    duration: 0.9,
                  }}
                  className="group"
                >
                  {/* Card container with atmosphere, glass-depth, and cinematic hover */}
                  <div
                    className="relative overflow-hidden rounded-sm"
                    style={{
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid var(--glass-depth-border)',
                      boxShadow: '0 0 0 1px var(--glass-shadow), 0 8px 32px var(--glass-shadow-penumbra), inset 0 1px 0 var(--glass-highlight-top)',
                    }}
                  >
                    {/* Atmospheric gradient inside card */}
                    <ServiceAtmosphere index={idx} />

                    {/* Hover state: brighter highlight + glow */}
                    <div
                      className="absolute inset-0 transition-opacity duration-700 pointer-events-none opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--color-gold-rgb), 0.06) 0%, transparent 60%)',
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-10">
                      <ServiceIndex index={idx} title={title} />

                      <h3 className="text-xl md:text-2xl font-serif font-light text-foreground mb-5 leading-snug group-hover:text-accent transition-colors duration-700">
                        {title}
                      </h3>

                      <p className="text-neutral-400 font-light leading-relaxed mb-8 text-sm md:text-base">
                        {description}
                      </p>

                      {/* Feature list */}
                      <FeatureList features={features} />

                      {/* Inquire CTA */}
                      <div className="mt-8 pt-6 border-t border-border/30">
                        <Link href="/contact">
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full group active:scale-[0.98]"
                          >
                            {t('services.inquire').replace('{title}', title)}
                            <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                              &rarr;
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Hover border highlight (CSS-only for smooth transition) */}
                    <div
                      className="absolute inset-0 rounded-sm pointer-events-none transition-all duration-700"
                      style={{
                        boxShadow: 'inset 0 0 0 1px rgba(var(--color-gold-rgb), 0)',
                        border: '1px solid transparent',
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 py-32 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true" style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(var(--color-gold-rgb), 0.03) 0%, transparent 50%)',
        }} />

        <div className="w-full text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRING_TRANSITION}
            className="font-mono text-[9px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block"
          >
            {t('services.ctaOverline')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_TRANSITION, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight text-foreground mb-6 leading-tight"
          >
            {t('services.ctaHeading')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_TRANSITION, delay: 0.2 }}
            className="text-neutral-400 font-light leading-relaxed mb-10 w-full max-w-2xl mx-auto text-base md:text-lg px-4"
          >
            {t('services.ctaDescription')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_TRANSITION, delay: 0.3 }}
          >
            <Link href="/contact">
              <Button variant="primary" size="lg" className="group active:scale-[0.97]">
                {t('contactUs')}
                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
