"use client";
import React from "react";
import Link from "next/link";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="relative px-8 md:px-16 py-48 overflow-hidden bg-surface border-t border-border/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-accent)/0.05_0%,transparent_70%)] pointer-events-none" />
      <ScrollFadeIn className="mx-auto text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-8 block"
        >
          Collaboration
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground mb-12 leading-[1.1]"
        >
          Ready to Define Your <br />
          <span className="italic text-accent">Next Space?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-neutral-400 font-light leading-relaxed mb-16 mx-auto max-w-2xl"
        >
          Every great project begins with a conversation. Reach out and let&apos;s
          explore what we can create together.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/contact">
            <Button variant="primary" size="lg" className="group">
              Get in Touch
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Button>
          </Link>
        </motion.div>
      </ScrollFadeIn>
      <div className="absolute bottom-0 left-0 w-px h-32 bg-gradient-to-t from-accent to-transparent opacity-20" />
      <div className="absolute bottom-0 right-0 w-px h-32 bg-gradient-to-t from-accent to-transparent opacity-20" />
    </section>
  );
}
