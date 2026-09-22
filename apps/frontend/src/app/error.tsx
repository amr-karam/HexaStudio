'use client';

import { useEffect } from "react";
import { captureException } from '@sentry/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-8 overflow-hidden bg-sl-void">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-10 pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sl-gold-subtle/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center flex flex-col items-center gap-8">
        {/* Error code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE.entrance }}
          className="relative"
        >
          <div className="text-[8rem] sm:text-[12rem] font-serif font-light tracking-tighter text-sl-alabaster/[0.03] leading-none select-none absolute inset-0 flex items-center justify-center">
            500
          </div>
          <div className="relative text-7xl md:text-[12rem] font-serif font-light tracking-tighter text-sl-alabaster/10 leading-none select-none">
            <span className="italic text-sl-gold-hover/30">Error</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE.entrance }}
          className="max-w-md"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-sl-alabaster mb-4">
            Something went <span className="italic text-sl-gold-hover">wrong</span>
          </h2>
          <p className="text-sl-mist/60 text-sm leading-relaxed font-light">
            The experience encountered an unexpected error. Our team has been notified.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE.entrance }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <button
            type="button"
            onClick={reset}
            className="group"
          >
            <Button variant="primary" size="lg">
              Try Again
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Button>
          </button>
          <Link href="/">
            <Button variant="outline" size="lg">
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom accent lines */}
      <div className="absolute bottom-0 start-0 w-px h-32 bg-gradient-to-t from-sl-gold-subtle to-transparent opacity-20" />
      <div className="absolute bottom-0 end-0 w-px h-32 bg-gradient-to-t from-sl-gold-subtle to-transparent opacity-20" />
    </main>
  );
}
