'use client';

import { motion, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { TextReveal } from '@/components/ui/TextReveal';
import { cn } from '@/lib/utils';
import { velocityToSkew } from '@/lib/motion/scroll-utils';
import { useScrollVelocity, useFinePointer } from '@/hooks';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import type { Article } from '@hexastudio/types';

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 };

interface BlogPageContentProps {
  articles: Article[];
}

export function BlogPageContent({ articles }: BlogPageContentProps) {
  // demilie.ru / cuberto DNA: velocity shear on the blog card grid.
  const { staticMode } = useMotionPolicy();
  const finePointer = useFinePointer();
  const velocity = useScrollVelocity();
  const skewY = useTransform(velocity, (v) => velocityToSkew(v, 3));
  const enableShear = !staticMode && finePointer;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="px-8 md:px-16">
        <header className="mb-32">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Thoughts & Insights
          </motion.span>
          <div className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-foreground leading-[0.9]">
            <TextReveal delay={0.1}>
              The Architectural <br />
              <span className="italic text-accent">Journal</span>
            </TextReveal>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.1 }}
            className="text-neutral-400 text-lg font-light mt-12 leading-relaxed w-full max-w-5xl"
          >
            Exploring the intersection of spatial design, real-time technology, and the
            emotional impact of architectural visualization.
          </motion.p>
        </header>

        {articles.length > 0 ? (
          <motion.div
            style={enableShear ? { skewY } : undefined}
            className="will-change-transform"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-24">
              {articles.map((article, idx) => {
                const isFeatured = idx === 0;
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING_TRANSITION, delay: idx * 0.08 }}
                    className={cn(
                      "group block",
                      isFeatured ? "md:col-span-12 lg:col-span-8" : "md:col-span-6 lg:col-span-4"
                    )}
                  >
                    <Link href={`/blog/${article.slug}`} className="block h-full">
                      <div className={cn(
                        "bg-surface-light overflow-hidden relative mb-8 transition-all duration-1000 ease-out-expo",
                        isFeatured ? "aspect-[21/9]" : "aspect-[16/10]"
                      )}>
                        {article.coverImage ? (
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            sizes={isFeatured ? "100vw" : "33vw"}
                            className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-dark" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                        {/* Hover Overlay — "Read →" morph (F5 DNA) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/20 backdrop-blur-[2px]">
                          <span className="text-xs uppercase tracking-[0.3em] text-white font-mono px-4 py-2 border border-white/30">
                            Read &rarr;
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          {article.category && (
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-accent font-mono">
                              {article.category.name}
                            </span>
                          )}
                          <span className="text-[10px] md:text-xs uppercase tracking-widest text-neutral-600 font-mono">
                            {article.readTime} min read
                          </span>
                        </div>
                        <h2 className={cn(
                          "font-serif font-light text-foreground group-hover:text-accent transition-colors duration-500 leading-tight",
                          isFeatured ? "text-4xl md:text-6xl" : "text-xl md:text-2xl"
                        )}>
                          {article.title}
                        </h2>
                        <p className={cn(
                          "text-neutral-500 font-light leading-relaxed line-clamp-2",
                          isFeatured ? "text-lg w-full" : "text-sm"
                        )}>
                          {article.excerpt}
                        </p>
                        <div className="h-[1px] w-0 group-hover:w-full bg-accent transition-all duration-700 mt-4" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="text-center py-24"
          >
            <p className="text-neutral-500 font-light text-lg">
              No articles yet. Check back soon for insights and deep dives.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
