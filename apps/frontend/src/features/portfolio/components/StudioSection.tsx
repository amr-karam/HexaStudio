'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { EASE, DURATION, makeTransition } from '@/lib/motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const StudioSection = () => {
  return (
    <section className="relative px-8 md:px-16 py-32 bg-void-deep overflow-hidden">
      {/* Layered ambient glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gold/[0.015] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
        {/* Image container */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={makeTransition('entrance', 'page')}
          className="relative aspect-square bg-surface overflow-hidden group"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: DURATION.camera, ease: EASE.entrance }}
            className="h-full w-full relative"
          >
            <Image
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2"
              alt="Studio workspace"
              fill
              sizes="(max-width: 1200px) 100vw, 50vw"
              className="object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000 ease-out-expo"
            />
          </motion.div>
          
          {/* Decorative border frame */}
          <div className="absolute inset-4 border border-gold/20 pointer-events-none group-hover:border-gold/40 transition-all duration-700" />
          <div className="absolute inset-6 border border-gold/10 pointer-events-none" />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-void-deep via-transparent to-transparent opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Technical Detail Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.component, ease: EASE.entrance }}
            className="absolute bottom-8 start-8 end-8 p-6 bg-void-deep/80 backdrop-blur-xl border border-gold/20 text-white transition-opacity duration-500 pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 mb-2 font-mono">Technical Spec</p>
            <p className="text-xs font-light leading-relaxed text-neutral-300">
              Utilizing OctaneRender & Unreal Engine 5 for real-time photorealistic light simulation.
            </p>
          </motion.div>
          
          {/* Corner accents */}
          <div className="absolute top-0 end-0 w-16 h-16 border-t-2 border-r-2 border-gold/30 group-hover:border-gold/60 transition-colors duration-700" />
          <div className="absolute bottom-0 start-0 w-16 h-16 border-b-2 border-l-2 border-gold/30 group-hover:border-gold/60 transition-colors duration-700" />
          
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gold/50" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gold/50" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={makeTransition('entrance', 'page', 0.2)}
          className="flex flex-col gap-10"
        >
          <div className="flex flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.5em] text-gold/60">The Studio</span>
            <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tighter text-foreground leading-tight">
              Precision in <br />
              <span className="italic text-gold">Every Pixel</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-400 font-light leading-relaxed">
              We don&apos;t just render buildings; we capture the atmosphere. By combining
              technical architectural data with cinematic lighting, we create spaces
              that evoke emotion before they are even built.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="flex flex-col gap-3 group cursor-default p-6 bg-surface/30 border border-border/20 group-hover:border-gold/30 transition-all duration-500">
              {/* Icon */}
              <div className="w-10 h-10 rounded-sm bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center mb-2 transition-colors duration-500">
                <svg className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-gold transition-colors duration-500">
                Immersion
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                Interactive 3D environments powered by R3F, enabling intuitive exploration.
              </p>
            </div>
            <div className="flex flex-col gap-3 group cursor-default p-6 bg-surface/30 border border-border/20 group-hover:border-gold/30 transition-all duration-500">
              {/* Icon */}
              <div className="w-10 h-10 rounded-sm bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center mb-2 transition-colors duration-500">
                <svg className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="6" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-gold transition-colors duration-500">
                Fidelity
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                8K photorealistic rendering with a focus on material authenticity.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Link href="/about">
              <Button variant="secondary" size="md" className="group">
                Learn About Us
                <span className="ml-2 inline-block transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </section>
  );
};