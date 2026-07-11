import { Article, ArticleResponse } from '@hexastudio/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.localhost';

export async function fetchArticles(): Promise<ArticleResponse> {
  try {
    const response = await fetch(`${API_URL}/api/articles`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`fetchArticles: API responded with ${response.status} ${response.statusText}`);
      return { articles: [], total: 0 };
    }

    return response.json();
  } catch (error) {
    console.error('fetchArticles: failed to reach articles API:', error);
    return { articles: [], total: 0 };
  }
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${API_URL}/api/articles/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`fetchArticle(${slug}): API responded with ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`fetchArticle(${slug}): failed to reach articles API:`, error);
    return null;
  }
}
