import { Article, ArticleResponse } from '@hexastudio/types';
import { API_BASE_URL } from '@/config/constants';

export async function fetchArticles(): Promise<ArticleResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
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

export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${slug}`, {
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
