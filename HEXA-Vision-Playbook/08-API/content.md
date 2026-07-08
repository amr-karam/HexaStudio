# Content API (Strapi Bridge)

**Base:** `/v1/content`

All content is fetched from Strapi CMS via the NestJS BFF layer. The BFF transforms Strapi's API response into the frontend-friendly format.

---

## Get Page Content

```http
GET /v1/content/pages/:slug
```

### Response (200)

```json
{
  "data": {
    "slug": "about",
    "sections": [
      {
        "type": "hero",
        "title": "About HEXA Studio",
        "subtitle": "Architecture visualized",
        "backgroundImage": "https://cdn.hexastudio.net/about/hero.webp"
      },
      {
        "type": "text",
        "content": "We are a team of architects and visualization artists..."
      },
      {
        "type": "team",
        "members": [
          {
            "name": "Jane Doe",
            "role": "Lead Architect",
            "image": "https://cdn.hexastudio.net/team/jane.webp",
            "bio": "10+ years of experience..."
          }
        ]
      }
    ],
    "seo": {
      "title": "About | HEXA Studio",
      "description": "Learn about HEXA Studio..."
    }
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 404 | Page not found |
| 502 | Strapi CMS unavailable |

---

## List Blog Posts

```http
GET /v1/content/blog?page=1&pageSize=10&category=architecture
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| pageSize | number | 10 | Items per page |
| category | string | — | Filter by category slug |
| tag | string | — | Filter by tag |

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Trends in Modern Architecture 2026",
      "slug": "trends-modern-architecture-2026",
      "excerpt": "Exploring the latest trends...",
      "coverImage": "https://cdn.hexastudio.net/blog/trends-2026/cover.webp",
      "category": "architecture",
      "author": "Jane Doe",
      "publishedAt": "2026-07-01T12:00:00Z",
      "readTime": 5
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## Get Blog Post

```http
GET /v1/content/blog/:slug
```

### Response (200)

```json
{
  "data": {
    "title": "Trends in Modern Architecture 2026",
    "slug": "trends-modern-architecture-2026",
    "content": "Full blog post content in markdown...",
    "coverImage": "https://cdn.hexastudio.net/blog/trends-2026/cover.webp",
    "category": { "name": "Architecture", "slug": "architecture" },
    "tags": ["modern", "trends", "2026"],
    "author": "Jane Doe",
    "publishedAt": "2026-07-01T12:00:00Z",
    "updatedAt": "2026-07-08T12:00:00Z",
    "seo": {
      "title": "Trends in Modern Architecture 2026 | HEXA Studio Blog",
      "description": "Exploring the latest trends...",
      "ogImage": "https://cdn.hexastudio.net/blog/trends-2026/og.webp"
    }
  }
}
```

---

## List Services

```http
GET /v1/content/services
```

### Response (200)

```json
{
  "data": [
    {
      "title": "Residential Design",
      "slug": "residential",
      "description": "Complete residential architectural design services...",
      "icon": "home",
      "order": 1,
      "featured": true,
      "seo": {
        "title": "Residential Design | HEXA Studio",
        "description": "Complete residential architectural design..."
      }
    }
  ]
}
```

---

## Get Service

```http
GET /v1/content/services/:slug
```

### Response (200)

```json
{
  "data": {
    "title": "Residential Design",
    "slug": "residential",
    "description": "Complete residential architectural design services...",
    "content": "Full service description...",
    "icon": "home",
    "features": [
      { "title": "Concept Design", "description": "..." },
      { "title": "Detailed Drawings", "description": "..." }
    ],
    "portfolio": [
      { "slug": "sunset-villa", "title": "Sunset Villa", "thumbnail": "..." }
    ],
    "seo": {
      "title": "Residential Design | HEXA Studio",
      "description": "Complete residential architectural design..."
    }
  }
}
```
