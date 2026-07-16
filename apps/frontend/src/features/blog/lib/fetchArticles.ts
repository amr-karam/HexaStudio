import { Article, ArticleResponse } from '@hexastudio/types';
import { API_BASE_URL } from '@/config/constants';

export async function fetchArticles(locale?: string): Promise<ArticleResponse> {
  try {
    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetch(`${API_BASE_URL}/api/articles${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { articles: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    return response.json();
  } catch {
    return { articles: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function fetchArticle(slug: string, locale?: string): Promise<Article | null> {
  try {
    const params = new URLSearchParams();
    if (locale) params.set('locale', locale);
    const query = params.toString();

    const response = await fetch(`${API_BASE_URL}/api/articles/${slug}${query ? `?${query}` : ''}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}
