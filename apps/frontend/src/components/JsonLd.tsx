import { sanitizeJsonLd } from '@/lib/jsonld';
import type { Metadata } from 'next';

export interface ProfessionalServiceJsonLdProps {
  title?: string;
  description?: string;
  url?: string;
  logo?: string;
  sameAs?: readonly string[];
  serviceType?: readonly string[];
}

export function ProfessionalServiceJsonLd({
  title = 'HexaStudio',
  description =
    'Living Spaces. Visualized. Immersive 3D architectural experiences and spatial intelligence for ambitious projects.',
  url = 'https://hexastudio.net',
  logo = 'https://hexastudio.net/logo.svg',
  sameAs = [
    'https://instagram.com/hexastudio',
    'https://linkedin.com/company/hexastudio',
  ],
  serviceType = [
    'Architectural Visualization',
    'Real-Time 3D Experiences',
    'Cinematic Animation',
    'Visual Consulting',
  ],
}: ProfessionalServiceJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: title,
    description,
    url,
    logo,
    sameAs,
    areaServed: 'Worldwide',
    serviceType,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(schema) }}
    />
  );
}

export interface WebPageJsonLdProps {
  title: string;
  description: string;
  url: string;
  breadcrumb?: readonly { name: string; item: string }[];
}

export function WebPageJsonLd({
  title,
  description,
  url,
  breadcrumb,
}: WebPageJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'HexaStudio',
      url: 'https://hexastudio.net',
    },
  };

  if (breadcrumb && breadcrumb.length > 0) {
    schema.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumb.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(schema) }}
    />
  );
}

export interface ItemListJsonLdProps {
  name: string;
  description: string;
  url: string;
  itemUrls: readonly string[];
  itemNames: readonly string[];
}

export function ItemListJsonLd({
  name,
  description,
  url,
  itemUrls,
  itemNames,
}: ItemListJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    itemListElement: itemNames.map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: itemUrls[index],
      name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(schema) }}
    />
  );
}

export function metadataWithCanonical(
  base: Omit<Metadata, 'alternates'> & { canonical?: string },
): Metadata {
  const { canonical, ...rest } = base;
  return {
    ...rest,
    alternates: {
      canonical: canonical ?? '/',
    },
  } satisfies Metadata;
}
