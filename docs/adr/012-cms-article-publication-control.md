# ADR 012: CMS Article Publication Control

**Status:** Proposed (Aug 16, 2026)
**Context:** The `Article` content type previously relied solely on the Strapi-native `publishedAt` field (part of the `draftAndPublish` feature). Editorial teams requested a more granular, non-system-controlled publication flag to manage content lifecycle across environments without triggering side-effects associated with `publishedAt` (like automatic sitemap generation or webhook events).

**Decision:** Added a manual Boolean attribute `isPublished` to `api::article.article` content type.

**Trade-offs:**
- **Pros:** Full editorial control; independent of system-level lifecycle hooks.
- **Cons:** Manual schema management required; potential for inconsistent states if `publishedAt` and `isPublished` drift apart.
- **Data Hygiene:** Legacy articles default to `null`, requiring application-level handling (`isPublished ?? false`) or a one-time database backfill to `true`.

**Implementation:**
- Statically added to `schema.json`.
- Frontend fetchers (`fetchProjects.ts`) updated to filter (`$or` logic for `true` or `$null`).
- Backfill script provided for cleanup.
