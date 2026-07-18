'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { EASE, DURATION, makeTransition } from '@/lib/motion';
import { RadialGlow } from '@/components/animation';

export const StudioSection = () => {
  return (
    <section className="px-8 md:px-16 py-32 bg-background relative overflow-hidden">
      <RadialGlow color="#D4AF37" size={600} top="-200px" right="-120px" blur={70} opacity={0.08} />
      <RadialGlow color="#D4AF37" size={400} bottom="-150px" left="-80px" blur={50} opacity={0.06} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={makeTransition('entrance', 'page')}
          className="relative aspect-square bg-surface-light overflow-hidden group"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: DURATION.camera, ease: EASE.entrance }}
            className="h-full w-full relative"
          >
            <Image
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2"
              alt="Studio"
              fill
              sizes="(max-width: 1200px) 100vw, 50vw"
              className="object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000 ease-out-expo"
            />
          </motion.div>
          
          <div className="absolute inset-0 border-[30px] border-background/20 pointer-events-none group-hover:border-background/10 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent opacity-60" />
          
          {/* Technical Detail Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-8 start-8 end-8 p-6 bg-black/40 backdrop-blur-xl border border-white/10 text-white transition-opacity duration-500 pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2 font-mono">Technical Spec</p>
            <p className="text-xs font-light leading-relaxed opacity-80">
              Utilizing OctaneRender & Unreal Engine 5 for real-time photorealistic light simulation.
            </p>
          </motion.div>
          
          <div className="absolute top-0 end-0 w-32 h-32 border-t-2 border-e-2 border-accent/30 group-hover:border-accent transition-colors duration-700" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={makeTransition('entrance', 'page', 0.2)}
          className="flex flex-col gap-12"
        >
          <div className="flex flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.5em] text-neutral-500">The Studio</span>
            <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tighter text-foreground leading-tight">
              Precision in <br />
              <span className="italic text-accent">Every Pixel</span>
            </h2>
            <p className="text-lg text-neutral-400 font-light leading-relaxed">
              We don&apos;t just render buildings; we capture the atmosphere. By combining
              technical architectural data with cinematic lighting, we create spaces
              that evoke emotion before they are even built.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="flex flex-col gap-3 group cursor-default">
              <h4 className="text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-accent transition-colors duration-500">
                Immersion
              </h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Interactive 3D environments powered by R3F, enabling intuitive exploration.
              </p>
            </div>
            <div className="flex flex-col gap-3 group cursor-default">
              <h4 className="text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-accent transition-colors duration-500">
                Fidelity
              </h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                8K photorealistic rendering with a focus on material authenticity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </section>
  );
};