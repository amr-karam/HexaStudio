import { Article, ArticleResponse } from '@hexastudio/types';
import { fetchJsonSafe } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export async function fetchArticles(): Promise<ArticleResponse> {
  return fetchJsonSafe<ArticleResponse>(
    `${API_URL}/api/articles`,
    { articles: [], total: 0 },
    { next: { revalidate: 3600 } },
  );
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  return fetchJsonSafe<Article | null>(
    `${API_URL}/api/articles/${slug}`,
    null,
    { next: { revalidate: 3600 } },
  );
}
