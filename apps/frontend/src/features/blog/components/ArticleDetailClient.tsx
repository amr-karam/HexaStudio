'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';
import { NewsletterSection } from '@/components/ui/NewsletterSection';
import { StrapiBlocks } from '@/components/ui/StrapiBlocks';

interface Article {
  title: string;
  slug: string;
  excerpt?: string;
  content?: unknown[];
  coverImage?: string;
  readTime?: number;
  publishedAt?: string;
  category?: { name: string };
}

interface ArticleDetailClientProps {
  article: Article;
}

export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative h-[70vh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className="object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-surface-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] uppercase tracking-[0.5em] text-accent mb-6 block font-mono"
            >
              {article.category?.name || 'Journal'}
            </motion.span>
            <div className="text-5xl md:text-8xl font-serif font-light tracking-tighter leading-tight mb-8">
              <TextReveal delay={0.6}>
                {article.title}
              </TextReveal>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center gap-6 text-neutral-400 text-xs uppercase tracking-widest font-mono"
            >
              <span>{article.readTime} min read</span>
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Coming soon'}</span>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-16 py-24">
        <div className="mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-invert prose-neutral max-w-none"
          >
            <p className="text-xl md:text-2xl font-light text-neutral-300 leading-relaxed mb-12 italic border-s-2 border-accent ps-6">
              {article.excerpt}
            </p>

            <div className="flex flex-col gap-12 text-neutral-400 font-light leading-relaxed text-lg">
              <StrapiBlocks content={article.content || []} />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-8 md:px-16 py-32 border-t border-border/50 bg-surface">
        <div className="flex flex-col items-center text-center gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-mono">
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
      <NewsletterSection />
    </main>
  );
}
