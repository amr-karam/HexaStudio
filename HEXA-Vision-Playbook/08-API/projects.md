# Projects API

**Base:** `/v1/projects`

---

## List Projects

```http
GET /v1/projects?category=residential&page=1&pageSize=12
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| category | string | — | Filter by category slug |
| featured | boolean | — | Only featured projects |
| page | number | 1 | Page number |
| pageSize | number | 20 | Items per page |
| sort | string | 'newest' | Sort order |

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Sunset Villa",
      "slug": "sunset-villa",
      "description": "Modern residential project...",
      "thumbnail": "https://cdn.hexastudio.net/projects/sunset-villa/thumb.webp",
      "category": "residential",
      "year": 2026,
      "featured": true,
      "publishedAt": "2026-07-01T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

## Get Project

```http
GET /v1/projects/:slug
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "title": "Sunset Villa",
    "slug": "sunset-villa",
    "description": "Modern residential project with sustainable design principles...",
    "content": "Full project description in markdown...",
    "images": [
      { "url": "https://...", "alt": "Living room", "width": 1920, "height": 1080 }
    ],
    "scene": {
      "modelUrl": "https://cdn.hexastudio.net/models/sunset-villa.glb",
      "cameraPosition": [5, 2, 8],
      "ambientLight": { "intensity": 0.5, "color": "#ffffff" },
      "hotspots": [
        { "position": [2, 1, 3], "label": "Living Room", "description": "..." }
      ]
    },
    "category": "residential",
    "tags": ["modern", "sustainable", "villa"],
    "year": 2026,
    "featured": true,
    "seo": {
      "title": "Sunset Villa | HEXA Studio",
      "description": "Modern sustainable villa project...",
      "ogImage": "https://..."
    },
    "relatedProjects": [
      { "slug": "other-project", "title": "Other Project", "thumbnail": "..." }
    ],
    "publishedAt": "2026-07-01T12:00:00Z"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 404 | Project not found |

---

## Get Featured Projects

```http
GET /v1/projects/featured
```

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Sunset Villa",
      "slug": "sunset-villa",
      "thumbnail": "https://...",
      "category": "residential"
    }
  ]
}
```
