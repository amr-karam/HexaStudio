import { Article, ArticleResponse } from '@hexastudio/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export async function fetchArticles(): Promise<ArticleResponse> {
  try {
    const response = await fetch(`${API_URL}/api/articles`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { articles: [], total: 0 };
    }

    return response.json();
  } catch {
    return { articles: [], total: 0 };
  }
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${API_URL}/api/articles/${slug}`, {
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
