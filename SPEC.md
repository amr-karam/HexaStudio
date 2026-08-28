# Editorial Hero CMS Integration - Specification

## Overview
Integrate the CMS-driven Editorial Hero component (`HeroEditorial`) with Strapi by adding the `editorialHero` field to the Page content type. This allows content editors to configure hero sections per page via Strapi admin.

## Current State
- ✅ Frontend: `HeroEditorial` component exists (`apps/frontend/src/components/hero/HeroEditorial.tsx`)
- ✅ Types: `EditorialHero` interface defined in `@hexastudio/types` (`packages/types/index.ts`)
- ✅ Frontend: `fetchEditorialHero` function exists (`apps/frontend/src/features/blog/lib/fetchEditorialHero.ts`)
- ✅ Frontend: `fetchPage` function exists (`apps/frontend/src/features/pages/lib/fetchPages.ts`)
- ✅ Backend: `PagesController` with `/api/pages/editorial-hero` endpoint (`apps/backend/src/modules/pages/pages.controller.ts`)
- ✅ Backend: `PagesService` with `getEditorialHero` and `mapEditorialHero` (`apps/backend/src/modules/pages/pages.service.ts`)
- ❌ **Strapi Page content type schema missing `editorialHero` field**

## Required Changes

### 1. Strapi Page Content Type Schema Update
**File:** `apps/cms/src/api/page/content-types/page/schema.json`

Add `editorialHero` as a **component** (recommended) or nested object with the following fields:
- `eyebrow` (string, optional) - Small mono eyebrow above title
- `title` (string, required) - Main display title, supports newline for line splits
- `accentWord` (string, optional) - Italic accent word rendered inside title
- `subtitle` (string, optional) - Supporting paragraph below title
- `primaryCtaLabel` (string, optional) - Primary CTA button label
- `primaryCtaHref` (string, optional) - Primary CTA button href
- `secondaryCtaLabel` (string, optional) - Secondary CTA link label
- `secondaryCtaHref` (string, optional) - Secondary CTA link href

**Recommended approach:** Use a Strapi **component** for reusability and cleaner admin UI.

### 2. Create Strapi Component for EditorialHero
**File:** `apps/cms/src/components/editorial-hero/schema.json`

Define the component schema matching the `EditorialHero` TypeScript interface.

### 3. Update Page Content Type to Use Component
Add `editorialHero` attribute to Page schema referencing the component.

### 4. Regenerate Strapi Types (if using type generation)
Run Strapi type generation to update TypeScript types.

### 5. Test Integration
- Create a page in Strapi admin with editorialHero configured
- Verify `/api/pages/editorial-hero?slug=<page>` returns the data
- Verify `HeroEditorial` renders correctly on the page

## API Contract

### GET `/api/pages/editorial-hero?slug=:slug`
**Response (200):**
```typescript
// When hero is configured
{
  "eyebrow": "Chapter 01 - Vision",
  "title": "Raw\nVision,\nRendered.",
  "accentWord": "Vision",
  "subtitle": "Worlds composed from light and restraint...",
  "primaryCtaLabel": "Enter the Work",
  "primaryCtaHref": "/projects",
  "secondaryCtaLabel": "The Atelier",
  "secondaryCtaHref": "/studio"
}

// When no hero configured
null
```

### GET `/api/pages/:slug`
**Response includes `editorialHero` field in Page object.**

## Component Tree
```
Page (layout)
  └── HeroEditorial (client component)
        └── Receives `hero` prop from `fetchEditorialHero(slug)`
```

## Data Flow
```
Strapi Admin (Page edit)
    → Strapi Page.content.editorialHero (component)
    → Strapi API `/api/pages?filters[slug]=...&populate=*`
    → Backend PagesService.mapEditorialHero()
    → Backend GET `/api/pages/editorial-hero?slug=...`
    → Frontend fetchEditorialHero(slug)
    → HeroEditorial component renders
```

## Rendering Strategy
- **Static/ISR:** `fetchEditorialHero` uses `next: { revalidate: 3600 }` - 1 hour ISR
- **Fallback:** `HeroEditorial` has built-in `DEFAULT_HERO` when no CMS data
- **SSR:** `fetchEditorialHero` runs on server (uses `process.env.API_URL`)

## Acceptance Criteria
1. Strapi Page content type has `editorialHero` component field
2. Can create/edit editorial hero in Strapi admin
3. `/api/pages/editorial-hero?slug=blog` returns EditorialHero JSON
4. `/api/pages/blog` returns Page with `editorialHero` populated
5. Blog page renders `HeroEditorial` with CMS data
6. No TypeScript errors in frontend/backend
7. All existing tests pass