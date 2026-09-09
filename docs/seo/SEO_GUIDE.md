# SEO Guide

**Version:** 1.1.0  
**Last Updated:** 2026-09-04  

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
| `title` | Yes | Include ` | HexaStudio` suffix |
| `description` | Yes | 150-160 characters |
| `openGraph` | Yes | Title, description, image, type |
| `twitter` | Yes | card, title, description, image |
| `canonical` | Yes | Self-referencing canonical URL |
| `robots` | Conditional | `noindex` for admin/dashboard pages |
| `alternates.languages` | Conditional | Include `x-default` when locale-specific routing is not yet live |
| `alternates.canonical` | Recommended | Use on every public page; include on home and section roots |

### Canonical Consistency Rule

- Use the exact production domain in `metadata.alternates.canonical`.
- Reuse one canonical URL constant per section when possible.
- Dynamic slugs must derive canonical from route params, not metadata body text.

### Robots Policy

- Public routes: `index: true, follow: true`
- Admin/dashboard/portal: `noindex, nofollow`
- Add `/api/`, `/_next/`, `/portal/`, `/admin/`, `/dashboard/` to robots disallow rules.
- Sitemap must always point to `https://hexastudio.net/sitemap.xml`.

### Breadcrumbs

- Public non-root pages should emit `WebPage` JSON-LD with a `BreadcrumbList` when a page hierarchy exists.
- Use `JsonLd.tsx` helpers for breadcrumbs, organization schema, and page lists.
- Do not emit duplicate JSON-LD on the same page.

### Implementation

```tsx
import { ProfessionalServiceJsonLd, WebPageJsonLd } from '@/components/JsonLd';

export default function Page() {
  return (
    <>
      <ProfessionalServiceJsonLd />
      <WebPageJsonLd
        title="About"
        description="Studio manifesto and design philosophy."
        url="https://hexastudio.net/about"
        breadcrumb={[
          { name: 'Home', item: 'https://hexastudio.net' },
          { name: 'About', item: 'https://hexastudio.net/about' },
        ]}
      />
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
