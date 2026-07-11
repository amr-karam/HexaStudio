import { Category } from '@hexastudio/types';

/**
 * A Strapi relation/media field. Supports both the Strapi v5 flat shape
 * ({ id, name, slug, url }) and the Strapi v4 nested shape
 * ({ data: { id, attributes: { ... } } }).
 */
export interface StrapiRelation {
  data?: { id: number; attributes?: Record<string, unknown> };
  id?: number;
  name?: string;
  slug?: string;
  url?: string;
}

/**
 * Normalizes a Strapi entry, returning its attributes regardless of whether
 * the payload uses the v5 flat shape or the v4 `attributes` wrapper.
 */
export function getAttributes(item: Record<string, unknown>): Record<string, unknown> {
  return (item.attributes ?? item) as Record<string, unknown>;
}

/**
 * Resolves the total count for a Strapi list response, falling back to the
 * length of the returned data array when pagination metadata is absent.
 */
export function getTotal(data: {
  meta?: { pagination?: { total?: number } };
  data: unknown[];
}): number {
  return data.meta?.pagination?.total ?? data.data.length;
}

/**
 * Maps a Strapi category relation into the shared Category type, supporting
 * both the flat (v5) and nested (v4) relation shapes.
 */
export function mapCategory(relation: StrapiRelation | undefined): Category | undefined {
  if (!relation) return undefined;
  // Strapi v5: flat relation { id, name, slug }
  if (relation.id && relation.name) {
    return { id: String(relation.id), name: relation.name, slug: relation.slug ?? '' };
  }
  // Strapi v4: nested relation { data: { id, attributes: { name, slug } } }
  if (relation.data) {
    return {
      id: String(relation.data.id),
      name: (relation.data.attributes?.name as string) ?? '',
      slug: (relation.data.attributes?.slug as string) ?? '',
    };
  }
  return undefined;
}

/**
 * Maps a Strapi media relation into its URL, supporting a plain string, the
 * flat (v5) { url } shape, and the nested (v4) { data: { attributes: { url } } }
 * shape.
 */
export function mapMedia(relation: StrapiRelation | string | undefined): string | undefined {
  if (!relation) return undefined;
  // Strapi v5: flat media { url, name }
  if (typeof relation === 'string') return relation;
  if (relation.url) return relation.url;
  // Strapi v4: nested media { data: { attributes: { url } } }
  if (relation.data?.attributes?.url) return relation.data.attributes.url as string;
  return undefined;
}
