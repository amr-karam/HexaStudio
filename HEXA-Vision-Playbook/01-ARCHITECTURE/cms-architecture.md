# CMS Architecture

**Last Updated:** 2026-07-08

---

## Technology

- **CMS:** Strapi 5 (Headless)
- **Database:** PostgreSQL 16
- **Storage:** MinIO (S3-compatible)
- **Access:** Internal network only (via NestJS BFF)

## Content Types

### Project

```typescript
interface StrapiProject {
  title: string;
  slug: string;
  description: string;
  content: string;                // Rich text / markdown
  thumbnail: Media;
  images: Media[];
  model: Media;                   // GLB 3D model
  category: Relation<Category>;
  tags: string[];
  year: number;
  featured: boolean;
  sceneConfig: JSON;
  seo: SEO;
  publishedAt: DateTime;
}
```

### Blog Post

```typescript
interface StrapiBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: Media;
  category: Relation<Category>;
  author: string;
  tags: string[];
  seo: SEO;
  publishedAt: DateTime;
}
```

### Service

```typescript
interface StrapiService {
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  featured: boolean;
  seo: SEO;
}
```

### Category

```typescript
interface StrapiCategory {
  name: string;
  slug: string;
  description: string;
}
```

### SEO

```typescript
interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaImage: Media;
  canonicalURL: string;
  keywords: string;
  structuredData: JSON;
}
```

### Media

```typescript
interface Media {
  url: string;
  alternativeText: string;
  width: number;
  height: number;
  mime: string;
  size: number;
}
```

## Webhook Configuration

### Strapi → NestJS

| Event | Webhook URL | Payload |
|-------|-------------|---------|
| `entry.publish` | `POST /webhooks/strapi` | Entry type, ID, slug |
| `entry.unpublish` | `POST /webhooks/strapi` | Entry type, ID, slug |
| `entry.update` | `POST /webhooks/strapi` | Entry type, ID, slug |
| `media.create` | `POST /webhooks/strapi` | Media ID, URL |
| `media.delete` | `POST /webhooks/strapi` | Media ID |

### NestJS Processing

```typescript
@Post('/webhooks/strapi')
@Public()
async handleStrapiWebhook(@Body() body: StrapiWebhookPayload) {
  // Verify webhook signature
  this.validateWebhookSignature(body);

  // Determine affected pages
  const paths = this.getAffectedPaths(body.model, body.entry);

  // Trigger ISR revalidation
  await this.nextjsService.revalidatePaths(paths);

  // Invalidate Redis cache
  await this.cacheService.invalidate(body.model);

  // Log event
  logger.info('Strapi webhook processed', { model: body.model, entry: body.entry.id });
}
```

## ISR Flow

```
Strapi: Content published
  │
  ├── Webhook → NestJS
  │
  ▼
NestJS: validate webhook
  │
  ├── Identify affected pages
  │
  ▼
NestJS → Next.js: POST /api/revalidate
  │
  ▼
Next.js: Re-generate pages
  │
  ├── Clear pages from cache
  ├── Re-fetch from NestJS API
  ├── Re-render HTML
  │
  ▼
Client: Next request gets fresh HTML
```
