import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { fetchArticle, fetchArticles } from '@/features/blog/lib/fetchArticles';
import { ArticleDetailClient } from '@/features/blog/components/ArticleDetailClient';

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

  return <ArticleDetailClient article={article} />;
}
