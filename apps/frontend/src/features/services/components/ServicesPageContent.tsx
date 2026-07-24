'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import Link from 'next/link';
import TextCharReveal from '@/components/effects/TextCharReveal';
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/lib/utils';
import type { Service } from '@hexastudio/types';

const SilkShaderBackground = dynamic(
  () => import('@/components/effects/SilkShaderBackground'),
  { ssr: false },
);

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

interface ServicesPageContentProps {
  services: Service[];
}

export function ServicesPageContent({ services }: ServicesPageContentProps) {
  const { t } = useLocale();
  const hasServices = services.length > 0;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-20 pb-32 overflow-hidden">
        <SilkShaderBackground speed={0.25} opacity={0.1} />
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        
        <div className="text-center relative z-10 mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('services.expertise')}
          </motion.span>
          <div className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
            <TextCharReveal
              text={hasServices ? String(t('services.title')) : 'Our Services.'}
              as="h1"
              delay={0.15}
              stagger={0.03}
              blur
            />
          </div>
        </div>

        {hasServices ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full relative z-10">
            {services.map((service, idx) => {
              const isLarge = idx === 0 || idx === 2;
              const title = service.title;
              const description = service.description;
              const features = service.features;

              return (
                <motion.div
                  key={service.id || title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING_TRANSITION, delay: idx * 0.1 }}
                  className={cn(isLarge ? "md:col-span-7" : "md:col-span-5")}
                >
              <LiquidGlassCard glow className="p-8 md:p-12 h-full group relative overflow-hidden">
                  <div className="relative z-10 h-full flex flex-col">
                    <span className="text-xs font-mono text-neutral-600 mb-4 block">0{idx + 1} — SERVICE</span>
                    <h3 className="text-3xl font-serif font-light text-foreground mb-6 group-hover:text-accent transition-colors duration-500">
                      {title}
                    </h3>
                    <p className="text-neutral-400 font-light leading-relaxed mb-8 w-full max-w-md">
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
                            transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.05 * i }}
                          >
                            <span className="w-1 h-1 bg-accent rounded-full" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                      <Link href="/contact">
                        <Button variant="outline" size="lg" className="group-hover:bg-accent group-hover:text-background transition-all duration-500 active:scale-[0.97]">
                          {t('services.inquire').replace('{title}', title)}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  </LiquidGlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-10 py-24"
          >
            <p className="text-neutral-500 font-light text-lg">
              {t('services.comingSoon') || 'Our services are coming soon. Stay tuned.'}
            </p>
          </motion.div>
        )}
      </section>

      <section className="px-8 md:px-16 py-32 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />
        <div className="w-full text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRING_TRANSITION}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('services.ctaOverline')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_TRANSITION, delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-light tracking-tight text-foreground mb-8 leading-tight"
          >
            {t('services.ctaHeading')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING_TRANSITION, delay: 0.2 }}
            className="text-neutral-400 font-light leading-relaxed mb-12 w-full max-w-2xl mx-auto"
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
              <Button variant="primary" size="lg" className="group active:scale-[0.97] transition-transform duration-150">
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
