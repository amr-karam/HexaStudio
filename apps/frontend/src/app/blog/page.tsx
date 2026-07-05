'use client';

import { useArticles } from '@/features/blog';
import Link from 'next/link';

export default function BlogPage() {
  const { data, isLoading, error } = useArticles();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-16">
            <h1 className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--foreground)] mb-4">
              Blog
            </h1>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-[var(--surface)] rounded-lg mb-4" />
                <div className="h-6 bg-[var(--surface)] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[var(--surface)] rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-16">
            <h1 className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--foreground)] mb-4">
              Blog
            </h1>
          </header>
          <p className="text-[var(--neutral-400)]">Unable to load articles. Please try again later.</p>
        </div>
      </main>
    );
  }

  const articles = data?.articles ?? [];

  return (
    <main className="min-h-screen bg-[var(--background)] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-[var(--font-display)] text-[var(--foreground)] mb-4">
            Blog
          </h1>
          <p className="text-[var(--neutral-400)] text-lg max-w-2xl">
            Insights on architectural visualization, 3D technology, and design.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-[var(--neutral-400)]">No articles published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group block"
              >
                <article className="bg-[var(--surface)] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                  <div className="aspect-[16/10] bg-[var(--surface-light)] overflow-hidden">
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {article.category && (
                        <span className="text-xs uppercase tracking-wider text-[var(--accent)]">
                          {article.category.name}
                        </span>
                      )}
                      <span className="text-xs text-[var(--neutral-500)]">
                        {article.readTime} min read
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-[var(--neutral-400)] text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
