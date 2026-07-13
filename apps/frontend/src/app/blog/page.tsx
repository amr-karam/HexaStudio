'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useArticles } from '@/features/blog';
import Link from 'next/link';
import { TextReveal } from '@/components/ui/TextReveal';

const fallbackArticles = [
  {
    id: '1',
    title: 'The Art of Architectural Visualization',
    slug: 'art-of-architectural-visualization',
    excerpt: 'Exploring how photorealistic rendering transforms architectural concepts into immersive visual experiences that resonate with clients.',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    category: { name: 'Design', slug: 'design' },
    readTime: 6,
    author: 'HexaStudio',
  },
  {
    id: '2',
    title: 'Real-Time 3D: A New Era for Architecture',
    slug: 'real-time-3d-new-era',
    excerpt: 'How React Three Fiber and WebGL are revolutionizing the way architects present and iterate on their designs.',
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    category: { name: 'Technology', slug: 'technology' },
    readTime: 8,
    author: 'HexaStudio',
  },
  {
    id: '3',
    title: 'Lighting as a Narrative Tool',
    slug: 'lighting-as-narrative-tool',
    excerpt: 'Understanding how cinematic lighting techniques create emotional resonance in architectural spaces.',
    coverImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    category: { name: 'Technique', slug: 'technique' },
    readTime: 5,
    author: 'HexaStudio',
  },
];

export default function BlogPage() {
  const { data } = useArticles();

  const apiArticles = data?.articles ?? [];
  const articles = apiArticles.length > 0 ? apiArticles : fallbackArticles;

  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <div className="px-8 md:px-16">
        <header className="mb-32">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-neutral-400 text-lg font-light mt-12 leading-relaxed max-w-3xl"
          >
            Exploring the intersection of spatial design, real-time technology, and the 
            emotional impact of architectural visualization.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-24">
          {articles.map((article, idx) => {
            const isFeatured = idx === 0;
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
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
                        className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-dark" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/20 backdrop-blur-[2px]">
                       <span className="text-xs uppercase tracking-[0.3em] text-white font-mono px-4 py-2 border border-white/30">Read Article</span>
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
                      isFeatured ? "text-lg max-w-2xl" : "text-sm"
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
      </div>
    </main>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
