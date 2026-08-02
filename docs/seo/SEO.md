# SEO Governance - HEXA STUDIO

## Principles
- **Semantic HTML:** Use proper heading hierarchy (H1-H6), semantic tags, and descriptive metadata.
- **Performance:** Fast loading speeds (Core Web Vitals) are foundational to SEO.
- **Discoverability:** Maintain a valid `sitemap.xml` and `robots.txt`.
- **Content:** Unique, high-quality content optimized for architectural studio search intent.
- **Social:** Proper Open Graph (`og:`) and Twitter/X metadata for rich link previews.

## Implementation Strategy
- **Framework:** Next.js Metadata API for page-specific SEO.
- **Structured Data:** Use JSON-LD (Schema.org) for studio information, projects, and services to enhance search visibility.
- **Monitoring:** Track performance and search indexing issues via Google Search Console.

## Audit Strategy
- **Automated:** Lighthouse checks in CI/CD pipeline.
- **Manual:** Periodic review of search performance in Google Search Console.
