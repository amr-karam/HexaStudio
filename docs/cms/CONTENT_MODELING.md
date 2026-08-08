# CMS Content Modeling Architecture

**Version:** 1.0 | **Status:** Active | **Authority:** `docs/cms/README.md`
**Scope:** Content modeling — content types, components, dynamic zones, relations, media, localization, validation
**Implementation:** `apps/cms/src/api/` (Strapi API)

---

## 1. Content Modeling Philosophy

Content modeling follows an architectural approach — content is structured with intention. Every content type, component, and field serves a purpose in the platform content strategy.

### 1.1 Modeling Principles

- **Purpose-driven** — Every field serves a specific purpose
- **Reusability** — Components and content types are designed to be reused
- **Flexibility** — Content types support current and future editorial needs
- **Clarity** — Field names, descriptions, and structures are clear
- **Validation** — Proper validation ensures content quality and consistency
- **Performance** — Content models are designed for efficient querying and rendering
- **Extensibility** — Content models can evolve without breaking existing content

### 1.2 Content Type Design Process

1. Identify the entity
2. Define the purpose
3. Identify fields
4. Design relations
5. Design components
6. Define validation
7. Design media
8. Design SEO
9. Review completeness

---

## 2. Content Type Architecture

### 2.1 Content Type Structure

Every content type follows a consistent structure with apiVersion, kind, metadata (name, displayName, description, visible, draftAndPublish), and schema (properties with typed fields).

### 2.2 Core Content Types

**Project** — Architecture projects. Key fields: title, slug, client, architect, location, year, category, description, longDescription, challenge, solution, heroMedia, gallery, coverImage, beforeAfter, credits, stats, testimonials, relatedProjects, seo, publishedAt.

**Service** — Service offerings. Key fields: title, slug, shortDescription, description, capabilities, process, deliverables, examples, faq, featuredImage, icon, order, seo, publishedAt.

**Blog Post** — Journal/blog articles. Key fields: title, slug, excerpt, content, coverImage, author, category, tags, relatedProjects, seo, publishedAt.

**Category** — Content categorization. Key fields: title, slug, description, color, icon, parent, projects, blogPosts, seo, order.

**Testimonial** — Client testimonials. Key fields: quote, author, role, company, project, image, isFeatured, order, seo, publishedAt.

**Client** — Client information. Key fields: name, slug, logo, industry, location, website, description, projects, seo, order.

**Team Member** — Team information. Key fields: name, slug, role, avatar, bio, bioShort, specialties, email, phone, website, linkedin, twitter, instagram, projects, seo, order.

**FAQ** — Frequently asked questions. Key fields: question, answer, category, service, isPublished, order, publishedAt.

**Global Settings** — Site-wide settings (singleton). Key fields: siteName, siteDescription, logo, favicon, ogImage, twitterCardImage, socialLinks, contactInfo, seoDefaults, analytics, isPublished.

**Navigation** — Site navigation (singleton). Key fields: label, type, items, isPublished, order.

---

## 3. Component Architecture

Components are reusable content building blocks. Key components:

- **SEO** — metaTitle, metaDescription, metaKeywords, ogImage, twitterCardImage, canonicalUrl, noindex, nofollow, publishedAt
- **Credits** — Project credits (dynamic zone: name, role, image per person)
- **BeforeAfter** — Before/after comparison (beforeImage, afterImage, labelBefore, labelAfter, sliderPosition, caption)
- **Stats** — Statistics block (dynamic zone: value, label, prefix, suffix, icon)
- **Quote** — Quote block (quote, author, role, image, project)
- **Timeline** — Timeline of events (dynamic zone: date, title, description, image, link)
- **Gallery** — Image gallery (dynamic zone: image, caption, alt, order, link; layout, columns, captionPosition)
- **Video** — Video embed (videoUrl, thumbnail, title, description, autoplay, caption)
- **CTA** — Call to action (title, description, buttonText, buttonLink, buttonType, backgroundImage, backgroundColor)
- **Capabilities** — Service capabilities (dynamic zone: title, description, icon)
- **Process** — Service process (dynamic zone: stepNumber, title, description, image)
- **Deliverables** — Service deliverables (dynamic zone: title, description, icon)
- **FAQ** — FAQ block (dynamic zone: question, answer)
- **Social Links** — Social media links (dynamic zone: platform, url, label)
- **Contact Info** — Contact information (address, phone, email, workingHours)
- **Analytics** — Analytics configuration (googleAnalyticsId, googleTagManagerId, hotjarId)
- **Hero** — Page/section hero (title, subtitle, description, backgroundImage, backgroundVideo, cta, align)
- **Text** — Text block (content, alignment)
- **Image** — Image block (image, caption, alt, link, linkText, size)

---

## 4. Dynamic Zones

Dynamic zones allow content editors to compose pages from components.

### 4.1 Dynamic Zone Architecture

A dynamic zone is a flexible container that can hold multiple component instances in a specific order.

### 4.2 Dynamic Zone Usage

| Content Type | Dynamic Zone | Allowed Components |
|-------------|--------------|-------------------|
| Project | content | hero, text, image, gallery, video, quote, statistics, timeline, before-after, credits, cta |
| Blog Post | content | hero, text, image, gallery, video, quote, statistics, timeline, cta |
| Service | content | hero, text, capabilities, process, deliverables, gallery, video, quote, cta |
| Navigation | items | nav-link, nav-heading, nav-divider |

---

## 5. Relation Architecture

Content types are connected through relations:

- **One-to-One** — Single related record (Project → Category)
- **One-to-Many** — One record relates to many (Category → Projects)
- **Many-to-Many** — Many records relate to many (Project ↔ Related Projects)
- **Media** — Relation to media assets (Project → Hero Image)
- **Component** — Embedded component (Project → SEO component)

---

## 6. Media Architecture

### 6.1 Media Library

The media library is the central repository for all media assets: upload (drag-and-drop, multi-file), organize (folders, tags, categories), search (by filename, alt text, tags, metadata), transform (automatic transformations, thumbnails, responsive variants), metadata (alt text, caption, copyright, attribution).

### 6.2 Media Optimization

Media is optimized for delivery: images (WebP, AVIF formats, responsive variants, lazy loading), videos (MP4, WebM formats, adaptive streaming), 3D assets (GLB/glTF with compression, LOD optimization), documents (PDF, appropriate for download).

### 6.3 Media Delivery

Media is delivered through: direct CDN (media served via CDN for performance), presigned URLs (secure access for private media), responsive images (srcset and sizes for optimal image delivery), lazy loading (media loaded on demand).

---

## 7. Localization Architecture

### 7.1 Locales

The CMS supports multiple locales: English (en, LTR, default), Arabic (ar, RTL), German (de, LTR), Spanish (es, LTR), French (fr, LTR), Japanese (ja, LTR), Korean (ko, LTR), Chinese (zh, LTR).

### 7.2 Localization Features

- Field-level translation — each field can be translated independently
- Fallback locale — if a field is not translated, the default locale value is used
- Locale-specific slugs — slugs are unique per locale
- Locale-aware display — content is displayed in the requested locale
- Locale filtering — API can filter by locale

---

## 8. Validation Architecture

### 8.1 Field Validation

Each field type supports specific validation: string (required, unique, maxLength, minLength, format: email/uri/ip), text (required, maxLength), rich text (required), integer (required, minimum, maximum, step), float (required, minimum, maximum, step), boolean (required), date (required, min, max), datetime (required, min, max), media (required, multiple, allowedTypes, maxCount), relation (required, multiple, limit min/max), component (required), dynamic zone (required, allowedComponents, minSize, maxSize).

### 8.2 Validation Best Practices

Required fields are marked for fields that must have a value. Unique fields are enforced at the database level (slugs, etc.). Length constraints prevent excessively long values. Format validation ensures correct formats (email, URI, etc.). Range validation ensures numbers are within acceptable ranges. Media validation ensures correct file types and counts. Relation validation ensures valid relations.

---

## 10. References

- `docs/architecture/README.md` — Architecture manifest
- `docs/architecture/cms-architecture.md` — CMS architecture overview
- `docs/api/` — API documentation
- `docs/architecture/DATABASE_ARCHITECTURE.md` — Database architecture
- `apps/cms/` — Strapi application

---

*This document is the architecture of the HEXA STUDIO CMS content modeling. It defines how content types are structured, how components work, how dynamic zones enable flexible content composition, how relations connect content, how media is managed, how localization works, and how validation ensures content quality.*
