"use client";
import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";
import { ChapterMarker } from "@/components/animation/ChapterMarker";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { LiquidGlassCard } from "@/components/ui/LiquidGlassCard";
import { makeTransition } from "@/lib/motion";
import { useReducedMotion } from "@/hooks";

const SilkShaderBackground = dynamic(
  () => import("@/components/effects/SilkShaderBackground"),
  { ssr: false },
);

export function CTASection() {
  const reducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative px-8 md:px-16 py-48 overflow-hidden bg-surface border-t border-border/30"
    >
      <div className="absolute top-12 left-8 md:left-16 z-20">
        <ChapterMarker index={5} title="Contact" />
      </div>
      {/* Layered ambient glow */}
      <SilkShaderBackground speed={0.35} opacity={0.12} />
      <div className="absolute inset-0 gradient-radial-gold pointer-events-none" aria-hidden="true" />

      {/* Architectural line-drawing decoration */}
      <motion.div
        style={reducedMotion ? {} : { opacity: lineProgress }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Top-left corner bracket */}
        <motion.div
          style={reducedMotion ? {} : { pathLength: lineProgress }}
          className="absolute top-16 left-16 w-24 h-24"
        >
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="text-gold/15">
            <path
              d="M0 0 L96 0 L96 96"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeDasharray="200"
            />
          </svg>
        </motion.div>

        {/* Bottom-right corner bracket */}
        <motion.div
          style={reducedMotion ? {} : { pathLength: lineProgress }}
          className="absolute bottom-16 right-16 w-24 h-24 rotate-180"
        >
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="text-gold/15">
            <path
              d="M0 0 L96 0 L96 96"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeDasharray="200"
            />
          </svg>
        </motion.div>
      </motion.div>

      <LiquidGlassCard goldAccent className="mx-auto text-center relative z-10 max-w-4xl !p-12 md:!p-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0 }}
          className="text-xs uppercase tracking-[0.5em] text-gold/60 mb-8 block font-mono"
        >
          Collaboration
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.1 }}
          className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground mb-12 leading-[1.1]"
        >
          Ready to Define Your <br />
          <span className="italic text-gold">Next Space?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
          className="text-lg text-neutral-400 font-light leading-relaxed mb-16 mx-auto w-full max-w-2xl"
        >
          Every great project begins with a conversation. Reach out and let&apos;s
          explore what we can create together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Magnetic>
            <Link href="/contact">
              <Button variant="primary" size="lg" className="group min-w-[180px]">
                Start a Project
                <span className="ml-3 inline-block transition-transform duration-500 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Button>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/projects">
              <Button variant="secondary" size="lg" className="min-w-[180px]">
                View Our Work
              </Button>
            </Link>
          </Magnetic>
        </motion.div>
      </LiquidGlassCard>

      {/* Bottom gold accent divider */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
}
