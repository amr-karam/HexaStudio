/**
 * Shared SEO metadata utilities for HEXA Studio.
 *
 * Single source of truth for:
 *   - Canonical base URL
 *   - OG image (falls back to logo.svg when no page-specific image)
 *   - Locale list and hreflang map
 * - noindex / nofollow robots directive for private routes
 *
 * Usage:
 *   import { createMetadata, NOINDEX } from '@/lib/seo';
 *
 *   export const metadata = createMetadata({
 *     title: 'Contact',
 *     description: 'Get in touch with our studio.',
 *     path: '/contact',
 *   });
 *
 *   // For private pages
 *   export const metadata = { ...createMetadata({ ... }), robots: NOINDEX };
 */

import type { Metadata } from 'next';

/* ---------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */

/** Canonical production base URL — never changes per environment. */
export const SITE_URL = 'https://hexastudio.net';

/** Default OG image served at the canonical URL. */
export const OG_IMAGE = `${SITE_URL}/logo.svg`;

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Supported locales for hreflang. */
export const LOCALES = ['en', 'es', 'fr', 'de', 'ar', 'ja', 'ko', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

/** Map locale → absolute URL for hreflang `languages`. */
export function buildHreflang(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of LOCALES) {
    map[locale] = `${SITE_URL}/${locale}${path}`;
  }
  // x-default points to the canonical English URL
  map['x-default'] = `${SITE_URL}${path}`;
  return map;
}

/** Robots directive for private (admin/dashboard/portal) pages. */
export const NOINDEX: Metadata['robots'] = {
  index: false,
  follow: false,
  noarchive: true,
  noimageindex: true,
};

/* ---------------------------------------------------------------------------
 * Factory
 * ------------------------------------------------------------------------- */

export interface SeoOptions {
  title: string;
  description: string;
  path: string;
  /** Override the OG image URL (default: OG_IMAGE). */
  image?: string;
  /** Open Graph type — defaults to 'website'. */
  type?: 'website' | 'article' | 'profile';
  /** ISO date for article/blog type (enables datePublished/dateModified). */
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
  /** Set to true for admin/dashboard/portal pages. */
  noindex?: boolean;
}

/**
 * Build a consistent Metadata object for any page.
 * Merges with the root layout's `title.template = "%s | HexaStudio"`
 * because we only set the bare `title` string here.
 */
export function createMetadata(opts: SeoOptions): Metadata {
  const {
    title,
    description,
    path,
    image = OG_IMAGE,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'HexaStudio',
    locale = 'en_US',
    noindex = false,
  } = opts;

  const ogTitle = `${title} | HexaStudio`;
  const ogUrl = `${SITE_URL}${path}`;

  const ogImage = {
    url: image,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: `${title} | HexaStudio`,
  };

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: ogUrl,
      languages: buildHreflang(path),
    },
    openGraph: {
      title: ogTitle,
      description,
      url: ogUrl,
      siteName: 'HexaStudio',
      locale,
      type,
      images: [ogImage],
      ...(type === 'article' && publishedTime
        ? { publishedTime, modifiedTime, authors: [author] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  };

  if (noindex) {
    metadata.robots = NOINDEX;
  }

  return metadata;
}
