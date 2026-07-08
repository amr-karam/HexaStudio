import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { fetchArticle, fetchArticles } from '@/features/blog/lib/fetchArticles';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const articlesData = await fetchArticles();
    return (articlesData.articles ?? []).map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found | HexaStudio',
    };
  }

  const baseUrl = 'https://hexastudio.net';
  const imageUrl = article.coverImage ? `${article.coverImage}?w=1200&q=80` : `${baseUrl}/logo.svg`;

  return {
    title: `${article.title} | HexaStudio`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${baseUrl}/blog/${article.slug}`,
      siteName: 'HexaStudio',
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [imageUrl],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    notFound();
  }

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
              className="text-[10px] uppercase tracking-[0.5em] text-accent mb-6 block"
            >
              {article.category?.name || 'Journal'}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

      <section className="px-8 md:px-16 py-24">
        <div className="mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-invert prose-neutral max-w-none"
          >
            <p className="text-xl md:text-2xl font-light text-neutral-300 leading-relaxed mb-12 italic">
              {article.excerpt}
            </p>

            <div className="flex flex-col gap-12 text-neutral-400 font-light leading-relaxed text-lg">
              {Array.isArray(article.content)
                ? article.content
                    .filter(Boolean)
                    .map((block, idx) => (
                      <p key={idx}>{typeof block === 'string' ? block : JSON.stringify(block)}</p>
                    ))
                : <p>{String(article.content)}</p>}
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

