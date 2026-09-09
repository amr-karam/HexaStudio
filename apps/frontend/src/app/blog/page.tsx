import type { Metadata } from 'next';
import { fetchArticles } from '@/features/blog/lib/fetchArticles';
import { fetchEditorialHero } from '@/features/blog/lib/fetchEditorialHero';
import { BlogPageContent } from '@/features/blog/components/BlogPageContent';
import { HeroEditorial } from '@/components/hero/HeroEditorial';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchArticles();
  const articleCount = data.total;

  if (articleCount > 0) {
    const description = 'Editorial and insights on spatial design, real-time technology, and architectural visualization by HexaStudio.';
    return {
      title: 'Blog',
      description,
      alternates: { canonical: 'https://hexastudio.net/blog' },
      openGraph: {
        title: 'HexaStudio Blog — Architectural Visualization Insights',
        description,
        url: 'https://hexastudio.net/blog',
        type: 'website',
        images: [
          {
            url: 'https://hexastudio.net/logo.svg',
            width: 1200,
            height: 630,
            alt: 'HexaStudio Blog — Architectural Visualization Insights',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'HexaStudio Blog — Architectural Visualization Insights',
        description,
        images: ['https://hexastudio.net/logo.svg'],
      },
    };
  }

  return {
    title: 'Blog',
    description: 'Insights on spatial design, real-time technology, and architectural visualization by HexaStudio.',
    alternates: { canonical: 'https://hexastudio.net/blog' },
    openGraph: {
      title: 'HexaStudio Blog — Architectural Visualization Insights',
      description: 'Insights on spatial design, real-time technology, and architectural visualization.',
      url: 'https://hexastudio.net/blog',
      type: 'website',
      images: [
        {
          url: 'https://hexastudio.net/logo.svg',
          width: 1200,
          height: 630,
          alt: 'HexaStudio Blog — Architectural Visualization Insights',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HexaStudio Blog — Architectural Visualization Insights',
      description: 'Insights on spatial design, real-time technology, and architectural visualization.',
      images: ['https://hexastudio.net/logo.svg'],
    },
  };
}

export default async function BlogPage() {
  const [data, hero] = await Promise.all([
    fetchArticles(),
    fetchEditorialHero('blog'),
  ]);
  return (
    <>
      <HeroEditorial hero={hero ?? undefined} />
      <BlogPageContent articles={data.articles} showHeader={false} />
    </>
  );
}
