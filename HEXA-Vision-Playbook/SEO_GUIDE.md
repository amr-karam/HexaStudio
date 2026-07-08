# SEO Guide

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Technical SEO

### Metadata

Every page must use Next.js `generateMetadata`:

```typescript
// app/projects/[slug]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject(params.slug);

  return {
    title: `${project.title} | HEXA Studio`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.ogImage],
      type: 'article',
      locale: 'en_US',
      siteName: 'HEXA Studio',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.ogImage],
    },
    alternates: {
      canonical: `https://hexastudio.net/projects/${project.slug}`,
    },
  };
}
```

### Metadata Requirements

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Include " | HEXA Studio" suffix |
| `description` | Yes | 150-160 characters |
| `openGraph` | Yes | Title, description, image, type |
| `twitter` | Yes | card, title, description, image |
| `canonical` | Yes | Self-referencing canonical URL |
| `robots` | Conditional | `noindex` for admin/dashboard pages |

---

## Structured Data (JSON-LD)

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "HEXA Studio",
  "description": "Premium architectural visualization studio",
  "url": "https://hexastudio.net",
  "logo": "https://hexastudio.net/logo.png",
  "sameAs": [
    "https://instagram.com/hexastudio",
    "https://linkedin.com/company/hexastudio"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "City",
    "addressCountry": "Country"
  }
}
```

### Project / Portfolio Item

```json
{
  "@context": "https://schema.org",
  "@type": "Project",
  "name": "Sunset Villa",
  "description": "Modern residential project with sustainable design",
  "image": "https://hexastudio.net/projects/sunset-villa/main.jpg",
  "dateCreated": "2026-01-15",
  "author": {
    "@type": "Organization",
    "name": "HEXA Studio"
  },
  "keywords": "modern architecture, sustainable design, residential"
}
```

### Blog Post

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Trends in Modern Architecture 2026",
  "description": "Exploring the latest trends...",
  "image": "https://hexastudio.net/blog/hero.jpg",
  "datePublished": "2026-07-01",
  "dateModified": "2026-07-08",
  "author": {
    "@type": "Organization",
    "name": "HEXA Studio"
  },
  "publisher": {
    "@type": "Organization",
    "name": "HEXA Studio"
  }
}
```

### Implementation

```typescript
import { JsonLd } from '@/components/shared/JsonLd';

export function ProjectPage({ project }: { project: Project }) {
  return (
    <>
      <JsonLd data={projectStructuredData(project)} />
      {/* Page content */}
    </>
  );
}
```

---

## Sitemap

### Dynamic Sitemap

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const posts = await getPosts();

  return [
    {
      url: 'https://hexastudio.net',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://hexastudio.net/projects',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...projects.map(project => ({
      url: `https://hexastudio.net/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...posts.map(post => ({
      url: `https://hexastudio.net/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
```

### Robots.txt

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/

Sitemap: https://hexastudio.net/sitemap.xml
```

---

## Content Strategy

### Page Hierarchy

```
Home (priority: 1.0)
├── Projects (0.9)
│   └── Project Detail (0.8)
├── Services (0.8)
│   ├── Residential (0.7)
│   └── Commercial (0.7)
├── Blog (0.7)
│   └── Post (0.6)
├── About (0.7)
└── Contact (0.6)
```

### URL Structure

```
hexastudio.net/
hexastudio.net/projects
hexastudio.net/projects/sunset-villa
hexastudio.net/services
hexastudio.net/services/residential
hexastudio.net/blog
hexastudio.net/blog/architecture-trends-2026
hexastudio.net/about
hexastudio.net/contact
```

### Internal Linking

- Every project page links to 3 related projects
- Blog posts link to relevant projects
- Service pages link to relevant portfolio items
- Breadcrumb navigation on all non-home pages

---

## Performance & SEO

SEO and performance are intrinsically linked. See `PERFORMANCE_STANDARDS.md` for:

- LCP targets (< 1.2s)
- Mobile-first responsive design
- Image optimization (WebP/AVIF)
- Font loading strategy
- Core Web Vitals monitoring

---

## Localization Strategy

- Default locale: `en-US`
- hreflang tags for all localized content
- URL structure: `hexastudio.net/{locale}/projects/...`
- Automatic redirect based on `Accept-Language` header

```html
<link rel="alternate" hreflang="en" href="https://hexastudio.net/projects/sunset-villa" />
<link rel="alternate" hreflang="ar" href="https://hexastudio.net/ar/projects/sunset-villa" />
<link rel="alternate" hreflang="x-default" href="https://hexastudio.net/projects/sunset-villa" />
```

---

## Monitoring

| Tool | Purpose |
|------|---------|
| Google Search Console | Index status, crawl errors |
| Google Analytics 4 | Traffic analysis, user behavior |
| Lighthouse CI | Performance + SEO in CI |
| Ahrefs / SEMrush | Keyword ranking (optional) |

---

## SEO Checklist

### Before Launch

- [ ] Every page has unique title and meta description
- [ ] Open Graph tags on all pages
- [ ] Twitter Cards on all pages
- [ ] Canonical URLs on all pages
- [ ] JSON-LD structured data for Organization, Project, BlogPosting
- [ ] Dynamic sitemap.xml generated
- [ ] robots.txt configured
- [ ] 404 page has useful navigation
- [ ] Redirect map for old URLs (if migrating)
- [ ] Core Web Vitals targets met

### Ongoing

- [ ] New content gets metadata immediately
- [ ] Stale content is updated or removed
- [ ] 404s are monitored and redirected
- [ ] Backlink profile is healthy
- [ ] Search Console errors are resolved within 48 hours
