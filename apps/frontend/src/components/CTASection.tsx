"use client";
import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChapterMarker } from "@/components/animation/ChapterMarker";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { LiquidGlassCard } from "@/components/ui/LiquidGlassCard";
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
      className="relative px-5 sm:px-6 md:px-12 lg:px-16 py-16 sm:py-20 md:py-32 lg:py-48 overflow-hidden bg-sl-obsidian border-t border-sl-silver/20"
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
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="text-sl-gold-hover/15">
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
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="text-sl-gold-hover/15">
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

      <LiquidGlassCard goldAccent className="mx-auto text-center relative z-10 max-w-4xl !p-8 sm:!p-12 md:!p-16 px-4 sm:px-6">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0 }}
          className="text-xs uppercase tracking-[0.5em] text-sl-gold-hover/60 mb-8 block font-mono"
        >
          Collaboration
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-light tracking-tighter text-sl-alabaster mb-6 sm:mb-8 md:mb-12 leading-[1.1]"
        >
          Ready to Define Your <br />
          <span className="italic text-sl-gold-hover">Next Space?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
          className="text-base sm:text-lg text-sl-mist/60 font-light leading-relaxed mb-10 sm:mb-16 mx-auto w-full max-w-2xl"
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
              <Button variant="primary" size="lg" aria-label="Start a Project" className="group min-w-[160px] sm:min-w-[180px] min-h-[48px]">
                Start a Project
                <span className="ml-3 inline-block transition-transform duration-500 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Button>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/projects">
              <Button variant="secondary" size="lg" className="min-w-[160px] sm:min-w-[180px] min-h-[48px]">
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
