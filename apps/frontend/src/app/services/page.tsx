'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';
import { TextReveal } from '@/components/ui/TextReveal';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { useServices } from '@/features/services/hooks/useServices';
import { useLocale } from '@/i18n/LocaleProvider';
import { Service } from '@/types';
import { cn } from '@/lib/utils';
import { makeTransition } from '@/lib/motion';

const fallbackServices: (Service & { accent: string; i18nKey: string })[] = [
  {
    id: '1',
    title: 'Architectural Visualization',
    slug: 'architectural-visualization',
    description: '',
    features: [],
    order: 1,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent)',
    i18nKey: 'viz',
  },
  {
    id: '2',
    title: 'Real-Time 3D Experiences',
    slug: 'real-time-3d',
    description: '',
    features: [],
    order: 2,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent-light)',
    i18nKey: 'realtime',
  },
  {
    id: '3',
    title: 'Cinematic Animation',
    slug: 'cinematic-animation',
    description: '',
    features: [],
    order: 3,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent-dark)',
    i18nKey: 'animation',
  },
  {
    id: '4',
    title: 'Visual Consulting',
    slug: 'visual-consulting',
    description: '',
    features: [],
    order: 4,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    accent: 'var(--color-accent)',
    i18nKey: 'consulting',
  },
];

export default function ServicesPage() {
  const { data } = useServices();
  const { t } = useLocale();
  const hasApiData = data?.services?.length;
  const services = hasApiData
    ? data.services.map((s, i) => ({
        ...s,
        accent: 'var(--color-accent)',
        i18nKey: fallbackServices[i]?.i18nKey || '',
      }))
    : fallbackServices;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        
        <div className="text-center relative z-10 mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('services.expertise')}
          </motion.span>
          <div className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
            <TextCharReveal
              text={hasApiData ? String(t('services.title')) : 'Our Services.'}
              as="h1"
              delay={0.15}
              stagger={0.03}
              blur
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full relative z-10">
          {services.map((service, idx) => {
            const isLarge = idx === 0 || idx === 2;
            const i18nKey = service.i18nKey;
            const title = hasApiData
              ? service.title
              : t(`services.items.${i18nKey}.title`);
            const description = hasApiData
              ? service.description
              : t(`services.items.${i18nKey}.description`);
            const features = hasApiData
              ? service.features
              : (() => {
                  const result: string[] = [];
                  for (let i = 0; i < 3; i++) {
                    const feat = t(`services.items.${i18nKey}.features.${i}`);
                    if (feat !== `services.items.${i18nKey}.features.${i}`) result.push(feat);
                  }
                  return result;
                })();

            return (
              <motion.div
                key={service.id || title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={makeTransition('entrance', 'page', idx * 0.1)}
                className={cn(isLarge ? "md:col-span-7" : "md:col-span-5")}
              >
                <GlassCard variant="default" className="p-8 md:p-12 h-full group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-accent/10 transition-colors duration-500" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <span className="text-xs font-mono text-neutral-600 mb-4 block">0{idx + 1} — SERVICE</span>
                  <h3 className="text-3xl font-serif font-light text-foreground mb-6 group-hover:text-accent transition-colors duration-500">
                    {title}
                  </h3>
                  <p className="text-neutral-400 font-light leading-relaxed mb-8 max-w-md">
                    {description}
                  </p>
                  <div className="mt-auto">
                    <ul className="space-y-3 mb-12">
                      {features.map((item: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center gap-3 text-sm text-neutral-500 font-light"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <span className="w-1 h-1 bg-accent rounded-full" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                    <Link href="/contact">
                      <Button variant="outline" size="lg" className="group-hover:bg-accent group-hover:text-background transition-all duration-500">
                        {t('services.inquire').replace('{title}', title)}
                      </Button>
                    </Link>
                  </div>
                </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="px-8 md:px-16 py-32 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="w-full text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('services.ctaOverline')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground mb-8 leading-tight"
          >
            {t('services.ctaHeading')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-neutral-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            {t('services.ctaDescription')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/contact">
              <Button variant="primary" size="lg" className="group">
                {t('contactUs')}
                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
