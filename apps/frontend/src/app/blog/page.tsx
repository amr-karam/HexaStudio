'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useArticles } from '@/features/blog';
import Link from 'next/link';

export default function BlogPage() {
  const { data, isLoading, error } = useArticles();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
          <header className="mb-24">
            <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground mb-4">
              Journal
            </h1>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-surface-light mb-6" />
                <div className="h-6 bg-surface-light w-3/4 mb-2" />
                <div className="h-4 bg-surface-light w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
          <header className="mb-24">
            <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground mb-4">
              Journal
            </h1>
          </header>
          <p className="text-neutral-400">Unable to load articles. Please try again later.</p>
        </div>
      </main>
    );
  }

  const articles = data?.articles ?? [];

  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
        <header className="mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'var(--ease-out-expo)' }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block"
          >
            Thoughts & Insights
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'var(--ease-out-expo)' }}
            className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight"
          >
            The Architectural <br />
            <span className="italic text-accent">Journal</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'var(--ease-out-expo)' }}
            className="text-neutral-400 text-lg font-light max-w-2xl mt-8 leading-relaxed"
          >
            Exploring the intersection of spatial design, real-time technology, and the 
            emotional impact of architectural visualization.
          </motion.p>
        </header>

        {articles.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-neutral-500 font-light italic">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {articles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'var(--ease-out-expo)' }}
              >
                <Link href={`/blog/${article.slug}`} className="group block">
                  <div className="aspect-[16/10] bg-surface-light overflow-hidden relative mb-8">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out-expo"
                        />
                      ) : (
                      <div className="w-full h-full bg-surface-dark" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      {article.category && (
                        <span className="text-[9px] uppercase tracking-[0.3em] text-accent font-medium">
                          {article.category.name}
                        </span>
                      )}
                      <span className="text-[9px] uppercase tracking-widest text-neutral-600">
                        {article.readTime} min read
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif font-light text-foreground group-hover:text-accent transition-colors duration-500 leading-tight">
                      {article.title}
                    </h2>
                    <p className="text-neutral-500 text-sm font-light line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="h-[1px] w-0 group-hover:w-full bg-accent transition-all duration-700 mt-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
