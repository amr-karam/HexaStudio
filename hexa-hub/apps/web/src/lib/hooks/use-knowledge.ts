'use client';

import { useOdooList, useOdooItem } from './use-odoo-query';
import type { ListParams } from './use-odoo-query';

const KEYS = { articles: 'knowledge-articles', article: 'knowledge-article' } as const;

export function useKnowledgeArticles(filters?: ListParams) {
  return useOdooList(KEYS.articles, '/odoo/knowledge/articles', filters);
}

export function useKnowledgeArticle(id?: string | number) {
  return useOdooItem(KEYS.article, '/odoo/knowledge/articles', id);
}
