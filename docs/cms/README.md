# CMS — Content Management System Architecture

**Version:** 1.0 | **Status:** Active | **Authority:** `docs/architecture/README.md` (manifest)  
**Scope:** CMS architecture — Strapi headless CMS, content modeling, API, media, sync, deployment  
**Implementation:** `apps/cms/` (Strapi application)

---

## 1. CMS Overview

HEXA STUDIO uses **Strapi 5** as its headless CMS. Strapi is the content authority — it manages all editorial content, media assets, and content workflows. The frontend and other consumers access CMS content via a typed BFF (Backend-for-Frontend) API layer, never directly.

### 1.1 CMS Role in the Platform

| Role | Description |
|-------|-------------|
| **Content Authority** | Single source of truth for editorial content |
| **Content Modeling** | Defines content types, components, dynamic zones |
| **Media Management** | Stores, manages, and serves media assets |
| **Content Workflow** | Manages content lifecycle: draft → review → publish |
| **API Provider** | Exposes content via REST and GraphQL APIs |
| **Admin Interface** | Provides editorial UI for content editors |

### 1.2 CMS Architecture Position

```
┌────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  • Consumes content via BFF API                             │
│  • Never directly accesses Strapi                           │
│  • Uses typed API client (@hexastudio/ui + custom hooks)   │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                   NestJS BFF (Backend)                      │
│  • Authenticates requests                                    │
│  • Aggregates CMS + Odoo + other data sources               │
│  • Provides unified API to frontend                          │
│  • Caches CMS responses                                      │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                   Strapi CMS (apps/cms)                     │
│  • Content types, components, dynamic zones                 │
│  • REST API, GraphQL (where configured)                     │
│  • Media library, asset management                          │
│  • Admin interface for editors                               │
│  • Webhooks for content changes                              │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Database)                    │
│  • Strapi database (content, media, config)                 │
│  • Separate from backend PostgreSQL                          │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Content Modeling Architecture

### 2.1 Content Type Architecture

Content types are the primary building blocks of the CMS. Each content type represents a distinct entity in the system.

#### Core Content Types

| Content Type | Purpose | Key Fields |
|-------------|---------|------------|
| **Project** | Architecture projects | title, slug, client, architect, location, year, category, description, hero media, gallery, related projects, SEO |
| **Service** | Service offerings | title, slug, description, capabilities, process, deliverables, examples, FAQ, SEO |
| **Blog Post** | Journal/blog articles | title, slug, content, author, category, tags, cover image, publishedAt, SEO |
| **Category** | Content categorization | title, slug, description, parent, color, icon |
| **Testimonial** | Client testimonials | quote, author, role, company, image, project |
| **Client** | Client information | name, slug, logo, industry, location, website, description |
| **Team Member** | Team information | name, slug, role, avatar, bio, social links, specialties |
| **FAQ** | Frequently asked questions | question, answer, category, order |
| **Global Settings** | Site-wide settings | logo, favicon, social links, contact info, SEO defaults |
| **Navigation** | Site navigation | label, slug, items (nested), type |

#### Content Type Structure

Each content type follows a consistent structure:

```yaml
apiVersion: 1.0.0
kind: content-type
metadata:
  name: <kebab-case-name>
  displayName: <Human-readable name>
  description: <Description>
  visible: true
  draftAndPublish: true
schema:
  properties:
    <fieldName>:
      type: <fieldType>
      required: <boolean>
      unique: <boolean>        # Optional
      maxLength: <number>      # Optional (string fields)
      minLength: <number>      # Optional (string fields)
      minimum: <number>        # Optional (number fields)
      maximum: <number>        # Optional (number fields)
      enum: [<v1>, <v2>, ...]  # Optional (enumeration)
      multiple: <boolean>      # Optional (media, relation)
      allowedTypes: [<type1>, <type2>, ...]  # Optional (media)
      component: <componentName>  # Optional (component fields)
      relation: <relationType>  # Optional (relation fields)
      target: <targetContentType>  # Optional (relation fields)
```

---

## 3. Core Content Types

### 3.1 Project

The Project content type is the centerpiece of the HEXA STUDIO platform.

**Key fields:**
- `title` (string, required) — Project title
- `slug` (string, required, unique) — URL-friendly slug
- `client` (string) — Client name
- `architect` (string) — Lead architect or firm
- `location` (string) — Project location
- `year` (integer) — Year of completion
- `category` (relation → category) — Project category
- `description` (text, required) — Project description
- `longDescription` (richtext) — Long-form description
- `challenge` (text) — The challenge this project addressed
- `solution` (text) — The solution provided
- `heroMedia` (media, required) — Hero image
- `gallery` (media, multiple) — Project gallery
- `coverImage` (media) — Cover image for listings
- `beforeAfter` (component) — Before/after comparison
- `credits` (component) — Project credits
- `stats` (component) — Project statistics
- `testimonials` (relation → testimonial) — Project testimonials
- `relatedProjects` (relation → project) — Related projects
- `seo` (component) — SEO metadata
- `publishedAt` (datetime) — Publication date

### 3.2 Service

The Service content type represents a service offering.

**Key fields:**
- `title` (string, required) — Service title
- `slug` (string, required, unique) — URL-friendly slug
- `shortDescription` (string, required) — Short description for listings
- `description` (richtext, required) — Full service description
- `capabilities` (component) — Service capabilities
- `process` (component) — Service process
- `deliverables` (component) — Service deliverables
- `examples` (relation → project) — Example projects
- `faq` (component) — Service FAQ
- `featuredImage` (media) — Featured image
- `icon` (media) — Service icon
- `order` (integer) — Display order
- `seo` (component) — SEO metadata

### 3.3 Blog Post

The Blog Post content type represents journal/blog articles.

**Key fields:**
- `title` (string, required) — Article title
- `slug` (string, required, unique) — URL-friendly slug
- `excerpt` (string, required) — Short excerpt for listings
- `content` (richtext, required) — Full article content
- `coverImage` (media, required) — Cover image
- `author` (relation → team-member) — Article author
- `category` (relation → category) — Article category
- `tags` (relation → tag) — Article tags
- `relatedProjects` (relation → project) — Related projects
- `seo` (component) — SEO metadata
- `publishedAt` (datetime) — Publication date

### 3.4 Category

The Category content type represents content categorization.

**Key fields:**
- `title` (string, required) — Category title
- `slug` (string, required, unique) — URL-friendly slug
- `description` (string) — Category description
- `color` (string) — Category color (hex)
- `icon` (media) — Category icon
- `parent` (relation → category) — Parent category (for hierarchy)
- `projects` (relation → project) — Auto-populated
- `blogPosts` (relation → blog-post) — Auto-populated
- `seo` (component) — SEO metadata
- `order` (integer) — Display order

### 3.5 Testimonial

The Testimonial content type represents client testimonials.

**Key fields:**
- `quote` (text, required) — Testimonial quote
- `author` (string, required) — Author name
- `role` (string) — Author role/title
- `company` (string) — Author company
- `project` (relation → project) — Related project
- `image` (media) — Author image
- `isFeatured` (boolean) — Featured testimonial
- `order` (integer) — Display order
- `seo` (component) — SEO metadata

### 3.6 Client

The Client content type represents client information.

**Key fields:**
- `name` (string, required) — Client name
- `slug` (string, required, unique) — URL-friendly slug
- `logo` (media) — Client logo
- `industry` (string) — Client industry
- `location` (string) — Client location
- `website` (string, format: uri) — Client website URL
- `description` (text) — Client description
- `projects` (relation → project) — Auto-populated
- `seo` (component) — SEO metadata
- `order` (integer) — Display order

### 3.7 Team Member

The Team Member content type represents team information.

**Key fields:**
- `name` (string, required) — Team member name
- `slug` (string, required, unique) — URL-friendly slug
- `role` (string, required) — Team member role
- `avatar` (media) — Team member avatar
- `bio` (text) — Team member bio
- `bioShort` (string) — Short bio for listings
- `specialties` (string) — Team member specialties
- `email` (string, format: email) — Team member email
- `phone` (string) — Team member phone
- `website` (string, format: uri) — Team member website
- `linkedin` (string, format: uri) — LinkedIn profile
- `twitter` (string, format: uri) — Twitter/X profile
- `instagram` (string, format: uri) — Instagram profile
- `projects` (relation → project) — Auto-populated
- `seo` (component) — SEO metadata
- `order` (integer) — Display order

### 3.8 FAQ

The FAQ content type represents frequently asked questions.

**Key fields:**
- `question` (string, required) — FAQ question
- `answer` (richtext, required) — FAQ answer
- `category` (relation → category) — FAQ category
- `service` (relation → service) — Related service
- `isPublished` (boolean) — Whether this FAQ is published
- `order` (integer) — Display order
- `publishedAt` (datetime) — Publication date

### 3.9 Global Settings

The Global Settings content type represents site-wide settings (singleton, not visible in Content Manager).

**Key fields:**
- `siteName` (string, required) — Site name
- `siteDescription` (string) — Site description
- `logo` (media) — Site logo
- `favicon` (media) — Site favicon
- `ogImage` (media) — Open Graph image
- `twitterCardImage` (media) — Twitter card image
- `socialLinks` (component) — Social media links
- `contactInfo` (component) — Contact information
- `seoDefaults` (component) — Default SEO settings
- `analytics` (component) — Analytics configuration
- `isPublished` (boolean) — Whether these settings are active

### 3.10 Navigation

The Navigation content type represents site navigation (singleton, not visible in Content Manager).

**Key fields:**
- `label` (string, required) — Navigation label
- `type` (string, required, enum: main, footer, utility) — Navigation type
- `items` (dynamiczone, required) — Navigation items (nav-link, nav-heading, nav-divider components)
- `isPublished` (boolean) — Whether this navigation is active
- `order` (integer) — Display order

---

## 4. Component Architecture

Components are reusable content building blocks. Each component has a consistent structure:

```yaml
apiVersion: 1.0.0
kind: component
metadata:
  name: <kebab-case-name>
  displayName: <Human-readable name>
  description: <Description>
schema:
  properties:
    <fieldName>:
      type: <fieldType>
      required: <boolean>
      # ... field-specific options
```

### 4.1 Core Components

| Component | Purpose | Key Fields |
|-----------|---------|------------|
| **SEO** | SEO metadata | metaTitle, metaDescription, metaKeywords, ogImage, twitterCardImage, canonicalUrl, noindex, nofollow, publishedAt |
| **Credits** | Project credits | architects (dynamic zone), photographers (dynamic zone), designers (dynamic zone), engineers (dynamic zone), otherCredits (richtext) |
| **BeforeAfter** | Before/after comparison | beforeImage (media), afterImage (media), labelBefore (string), labelAfter (string), sliderPosition (enum), caption (string) |
| **Stats** | Statistics block | stats (dynamic zone: value, label, prefix, suffix, icon) |
| **Quote** | Quote block | quote (text), author (string), role (string), image (media), project (relation) |
| **Timeline** | Timeline of events | events (dynamic zone: date, title, description, image, link) |
| **Gallery** | Image gallery | images (dynamic zone: image, caption, alt, order, link), layout (enum), columns (integer), captionPosition (enum) |
| **Video** | Video embed | videoUrl (string), thumbnail (media), title (string), description (text), autoplay (boolean), caption (string) |
| **CTA** | Call to action | title (string), description (text), buttonText (string), buttonLink (string), buttonType (enum), backgroundImage (media), backgroundColor (color) |
| **Capabilities** | Service capabilities | capabilities (dynamic zone: title, description, icon) |
| **Process** | Service process | steps (dynamic zone: stepNumber, title, description, image) |
| **Deliverables** | Service deliverables | deliverables (dynamic zone: title, description, icon) |
| **FAQ** | FAQ block | faqs (dynamic zone: question, answer) |
| **Social Links** | Social media links | items (dynamic zone: platform, url, label) |
| **Contact Info** | Contact information | address (text), phone (string), email (string), workingHours (richtext) |
| **Analytics** | Analytics configuration | googleAnalyticsId (string), googleTagManagerId (string), hotjarId (string) |
| **Hero** | Page/section hero | title (string), subtitle (string), description (text), backgroundImage (media), backgroundVideo (media), cta (component), align (enum) |
| **Text** | Text block | content (richtext), alignment (enum) |
| **Image** | Image block | image (media), caption (string), alt (string), link (string), linkText (string), size (enum) |

---

## 5. Dynamic Zones

Dynamic zones allow content editors to compose pages from components. This is the key to flexible, editorial content.

### 5.1 Dynamic Zone Architecture

```
Dynamic Zone
  └── Components (in order)
       ├── Component Instance 1
       │   └── Component Fields
       ├── Component Instance 2
       │   └── Component Fields
       └── ...
```

### 5.2 Dynamic Zone Usage

Dynamic zones are used in:

| Content Type | Dynamic Zone | Allowed Components |
|-------------|--------------|-------------------|
| Project | content | hero, text, image, gallery, video, quote, statistics, timeline, before-after, credits, cta |
| Blog Post | content | hero, text, image, gallery, video, quote, statistics, timeline, cta |
| Service | content | hero, text, capabilities, process, deliverables, gallery, video, quote, cta |
| Navigation | items | nav-link, nav-heading, nav-divider |

### 5.3 Dynamic Zone Configuration

Dynamic zones are configured with:

- **Allowed components** — which components can be added
- **Component order** — the order components appear
- **Minimum/maximum components** — constraints on the number of components
- **Default components** — components that are pre-populated

---

## 6. Relation Architecture

Content types are connected through relations:

| Relation Type | Description | Example |
|-------------|-------------|--------|
| **One-to-One** | Single related record | Project → Category |
| **One-to-Many** | One record relates to many | Category → Projects |
| **Many-to-Many** | Many records relate to many | Project ↔ Related Projects |
| **Media** | Relation to media assets | Project → Hero Image |
| **Component** | Embedded component | Project → SEO component |

Relations are managed through Strapi's relation system, with proper population strategies in the API layer.

---

## 7. Media Architecture

### 7.1 Media Library

The media library is the central repository for all media assets:

- **Upload** — drag-and-drop, multi-file upload, supported formats
- **Organize** — folders, tags, categories
- **Search** — by filename, alt text, tags, metadata
- **Transform** — automatic transformations (thumbnails, responsive variants)
- **Metadata** — alt text, caption, copyright, attribution

### 7.2 Media Optimization

Media is optimized for delivery:

- **Images:** WebP, AVIF formats, responsive variants, lazy loading
- **Videos:** MP4, WebM formats, adaptive streaming where appropriate
- **3D Assets:** GLB/glTF with compression, LOD optimization
- **Documents:** PDF, appropriate for download

### 7.3 Media Delivery

Media is delivered through:

- **Direct CDN** — media served via CDN for performance
- **Presigned URLs** — secure access for private media
- **Responsive images** — `srcset` and `sizes` for optimal image delivery
- **Lazy loading** — media loaded on demand

---

## 8. Localization Architecture

### 8.1 Locales

The CMS supports multiple locales:

| Locale | Code | Direction | Description |
|--------|------|-----------|-------------|
| English | en | LTR | Default locale |
| Arabic | ar | RTL | Arabic locale |
| German | de | LTR | German locale |
| Spanish | es | LTR | Spanish locale |
| French | fr | LTR | French locale |
| Japanese | ja | LTR | Japanese locale |
| Korean | ko | LTR | Korean locale |
| Chinese | zh | LTR | Chinese locale |

### 8.2 Localization Features

- **Field-level translation** — each field can be translated independently
- **Fallback locale** — if a field is not translated, the default locale value is used
- **Locale-specific slugs** — slugs are unique per locale
- **Locale-aware display** — content is displayed in the requested locale
- **Locale filtering** — API can filter by locale

---

## 9. Validation Architecture

### 9.1 Field Validation

Each field type supports specific validation:

| Field Type | Validation Options |
|-------------|-------------------|
| **String** | required, unique, maxLength, minLength, format (email, uri, ip) |
| **Text** | required, maxLength |
| **Rich Text** | required |
| **Integer** | required, minimum, maximum, step |
| **Float** | required, minimum, maximum, step |
| **Boolean** | required |
| **Date** | required, min, max |
| **DateTime** | required, min, max |
| **Media** | required, multiple, allowedTypes, maxCount |
| **Relation** | required, multiple, limit (min/max) |
| **Component** | required |
| **Dynamic Zone** | required, allowedComponents, minSize, maxSize |

### 9.2 Validation Best Practices

- **Required fields** are marked for fields that must have a value
- **Unique fields** are enforced at the database level (slugs, etc.)
- **Length constraints** prevent excessively long values
- **Format validation** ensures correct formats (email, URI, etc.)
- **Range validation** ensures numbers are within acceptable ranges
- **Media validation** ensures correct file types and counts
- **Relation validation** ensures valid relations

---

## 10. References

### Internal

- `docs/architecture/README.md` — Architecture manifest
- `docs/architecture/cms-architecture.md` — CMS architecture overview
- `docs/api/` — API documentation
- `docs/architecture/DATABASE_ARCHITECTURE.md` — Database architecture
- `apps/cms/` — Strapi application

### External

- Strapi Documentation — CMS reference
- Strapi REST API Documentation — API reference
- Strapi GraphQL Documentation — GraphQL reference
- Strapi Plugins Documentation — Plugin reference

---

*This document is the architecture of the HEXA STUDIO CMS content modeling. It defines how content types are structured, how components work, how dynamic zones enable flexible content composition, how relations connect content, how media is managed, how localization works, and how validation ensures content quality.*
