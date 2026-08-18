import type { Metadata } from 'next';
import { fetchArticles } from '@/features/blog/lib/fetchArticles';
import { fetchEditorialHero } from '@/features/blog/lib/fetchEditorialHero';
import { BlogPageContent } from '@/features/blog/components/BlogPageContent';
import { HeroEditorial } from '@/components/hero/HeroEditorial';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchArticles();
  const articleCount = data.total;

  if (articleCount > 0) {
    const latest = data.articles[0];
    return {
      title: 'Blog',
      description: latest.seoDescription || latest.excerpt || 'Insights on spatial design, real-time technology, and architectural visualization by HexaStudio.',
      openGraph: {
        title: 'Blog | HexaStudio',
        description: latest.seoDescription || latest.excerpt || 'Insights on spatial design, real-time technology, and architectural visualization.',
        type: 'website',
      },
    };
  }

  return {
    title: 'Blog',
    description: 'Insights on spatial design, real-time technology, and architectural visualization by HexaStudio.',
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
