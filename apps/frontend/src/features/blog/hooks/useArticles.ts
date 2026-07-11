import { useQuery } from '@tanstack/react-query';
import { Article, ArticleResponse } from '@/types';
import { API_BASE_URL } from '@/config/constants';

export function useArticles() {
  return useQuery<ArticleResponse>({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });
}

export function useArticle(slug: string) {
  return useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/articles/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      return response.json();
    },
    enabled: !!slug,
  });
}
