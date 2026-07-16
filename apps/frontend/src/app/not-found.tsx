'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-8 overflow-hidden bg-background">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-10 pointer-events-none" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center flex flex-col items-center gap-8">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
        >
          Error 404
        </motion.span>

        <div className="text-7xl md:text-[12rem] font-serif font-light tracking-tighter text-foreground/10 leading-none select-none">
          <TextReveal delay={0.1}>404</TextReveal>
        </div>

        <div className="-mt-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-serif font-light tracking-tight text-foreground"
          >
            Space <span className="italic text-accent">Not Found</span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-neutral-500 text-sm max-w-md leading-relaxed font-light"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <Link href="/">
            <Button variant="primary" size="lg" className="group">
              Return Home
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button variant="outline" size="lg">
              View Projects
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom accent lines */}
      <div className="absolute bottom-0 start-0 w-px h-32 bg-gradient-to-t from-accent to-transparent opacity-20" />
      <div className="absolute bottom-0 end-0 w-px h-32 bg-gradient-to-t from-accent to-transparent opacity-20" />
    </main>
  );
}
