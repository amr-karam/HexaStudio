'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useArticles } from '@/features/blog/hooks/useArticles'; // Assuming this hook exists based on useArticles in blog/page.tsx
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // In a real app, we would have a useArticle(slug) hook. 
  // For now, we'll simulate the data fetching using the existing useArticles and finding the one by slug.
  const { data, isLoading, isError } = useArticles();

  if (isLoading) return <LoadingScreen />;
  if (isError) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Error loading article.</div>;

  const article = data?.articles?.find(a => a.slug === slug);

  if (!article) return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-serif font-light mb-8">Article Not Found</h1>
      <Link href="/blog">
        <Button variant="outline">Back to Journal</Button>
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Image / Header */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'var(--ease-out-expo)' }}
          className="absolute inset-0"
        >
          {article.coverImage ? (
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover opacity-60" 
            />
          ) : (
            <div className="w-full h-full bg-surface-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-16">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'var(--ease-out-expo)' }}
              className="text-[10px] uppercase tracking-[0.5em] text-accent mb-6 block"
            >
              {article.category?.name || 'Journal'}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'var(--ease-out-expo)' }}
              className="text-5xl md:text-8xl font-serif font-light tracking-tighter leading-tight mb-8"
            >
              {article.title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center gap-6 text-neutral-400 text-xs uppercase tracking-widest"
            >
              <span>{article.readTime} min read</span>
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              <span>Published 2026</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-8 md:px-16 py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'var(--ease-out-expo)' }}
            className="prose prose-invert prose-neutral max-w-none"
          >
            <p className="text-xl md:text-2xl font-light text-neutral-300 leading-relaxed mb-12 italic">
              {article.excerpt}
            </p>
            
            {/* Simulated content sections to mimic a real editorial layout */}
            <div className="flex flex-col gap-12 text-neutral-400 font-light leading-relaxed text-lg">
               <p>
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
               </p>
               
               <div className="relative my-16 group">
                 <div className="absolute -inset-4 border border-accent/20 group-hover:border-accent/50 transition-colors duration-700" />
                 <img 
                   src={article.coverImage || '/api/placeholder/1200/600'} 
                   alt="detail" 
                   className="w-full grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                 />
                 <span className="absolute -bottom-8 left-0 text-[10px] uppercase tracking-widest text-neutral-600">
                   Figure 1.0 — Architectural Detail
                 </span>
               </div>

               <p>
                 Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
               </p>
               
               <h3 className="text-3xl font-serif font-light text-foreground mt-16 mb-6">
                 The Synergy of Light and Form
               </h3>
               <p>
                 At HexaStudio, we believe that light is not just a tool for visibility, but a primary building material. By manipulating photons through virtual environments, we can evoke emotional responses that standard blueprints cannot convey.
               </p>
               <p>
                 Our approach integrates advanced Global Illumination algorithms with a deep understanding of architectural psychology. The result is a visual experience that transcends mere representation, becoming a visceral encounter with the space.
               </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="px-8 md:px-16 py-32 border-t border-border/50 bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500">
              Continue Reading
            </span>
            <Link href="/blog">
              <Button variant="outline" size="lg">
                Back to Journal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
