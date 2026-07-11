import { useQuery } from '@tanstack/react-query';
import { Article, ArticleResponse } from '@/types';
import { fetchJson } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useArticles() {
  return useQuery<ArticleResponse>({
    queryKey: ['articles'],
    queryFn: () =>
      fetchJson<ArticleResponse>(`${API_URL}/articles`, undefined, 'Failed to fetch articles'),
  });
}

export function useArticle(slug: string) {
  return useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: () =>
      fetchJson<Article>(`${API_URL}/articles/${slug}`, undefined, 'Failed to fetch article'),
    enabled: !!slug,
  });
}
