import './setup';
import { describe, it, expect } from 'vitest';
import {
  getAttributes,
  getTotal,
  mapCategory,
  mapMedia,
} from '../src/common/strapi.util';

describe('strapi.util', () => {
  describe('getAttributes', () => {
    it('returns the v4 attributes wrapper when present', () => {
      expect(getAttributes({ id: 1, attributes: { title: 'A' } })).toEqual({ title: 'A' });
    });

    it('returns the flat v5 item when there is no attributes wrapper', () => {
      expect(getAttributes({ id: 1, title: 'A' })).toEqual({ id: 1, title: 'A' });
    });
  });

  describe('getTotal', () => {
    it('prefers pagination metadata', () => {
      expect(getTotal({ meta: { pagination: { total: 42 } }, data: [{}] })).toBe(42);
    });

    it('falls back to the data array length', () => {
      expect(getTotal({ data: [{}, {}, {}] })).toBe(3);
    });
  });

  describe('mapCategory', () => {
    it('maps a flat (v5) relation', () => {
      expect(mapCategory({ id: 3, name: 'News', slug: 'news' })).toEqual({
        id: '3',
        name: 'News',
        slug: 'news',
      });
    });

    it('maps a nested (v4) relation', () => {
      expect(
        mapCategory({ data: { id: 5, attributes: { name: 'Blog', slug: 'blog' } } }),
      ).toEqual({ id: '5', name: 'Blog', slug: 'blog' });
    });

    it('returns undefined when absent', () => {
      expect(mapCategory(undefined)).toBeUndefined();
    });
  });

  describe('mapMedia', () => {
    it('returns a plain string url', () => {
      expect(mapMedia('http://x/a.png')).toBe('http://x/a.png');
    });

    it('maps a flat (v5) media url', () => {
      expect(mapMedia({ url: 'http://x/b.png' })).toBe('http://x/b.png');
    });

    it('maps a nested (v4) media url', () => {
      expect(mapMedia({ data: { id: 1, attributes: { url: 'http://x/c.png' } } })).toBe(
        'http://x/c.png',
      );
    });

    it('returns undefined when absent', () => {
      expect(mapMedia(undefined)).toBeUndefined();
    });
  });
});
