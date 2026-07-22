# 🔍 SEO Standards

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Target:** Page 1 Rankings

## Technical SEO

### Meta Tags
```html
<!-- Page metadata -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Unique, descriptive 150-160 char summary" />
<meta name="keywords" content="relevant, keywords, here" />
<meta name="robots" content="index, follow" />

<!-- Open Graph (Social Sharing) -->
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Description" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Title" />
<meta name="twitter:description" content="Description" />
<meta name="twitter:image" content="URL" />
```

### Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HEXA Studio",
  "url": "https://hexastudio.net",
  "logo": "https://hexastudio.net/logo.svg",
  "description": "Digital products with 3D visualization"
}
```

### Sitemap
- `robots.txt` listing sitemap location
- `sitemap.xml` with all public pages
- Priority: Home (1.0), Category (0.8), Page (0.6)
- Last modified dates updated

### URL Structure
- Descriptive, keyword-rich URLs
- Use hyphens (not underscores)
- Lowercase
- Example: `/projects/3d-architectural-visualization`

---

## Content Strategy

### Target Keywords
1. Primary: "3D architectural visualization agency"
2. Secondary: "3D product rendering", "3D design services"
3. Long-tail: "Best 3D rendering for real estate" (low competition)

### On-Page Optimization
- **H1 tag:** One per page, contains primary keyword
- **Title:** 50-60 characters, includes keyword
- **Description:** 150-160 characters, compelling CTA
- **Content:** 1500+ words for pillar pages, keyword density 1-2%
- **Images:** Descriptive filenames, alt text with keywords

### Content Types
- **Pillar Pages:** Comprehensive guides (5000+ words)
- **Cluster Content:** Deep-dive topics (1500+ words)
- **Blog Posts:** Regular insights (800-1200 words)
- **Case Studies:** Project showcases (2000+ words)

---

## Link Building

### Internal Linking
- Link to relevant pages naturally
- Use descriptive anchor text (not "click here")
- One to three internal links per 1000 words
- Deep link to relevant subpages

### External Links
- Link to authoritative sources
- Relevance over quantity
- Use descriptive anchor text
- Avoid link schemes

---

## Performance Impact on SEO

- **Page Speed:** Major ranking factor
- **Mobile Optimization:** Required for mobile-first indexing
- **Core Web Vitals:** Part of ranking algorithm
- **SSL Certificate:** Required (https://)

See: [Performance Standards](./PERFORMANCE.md)

---

## Monitoring & Measurement

### Tools
- **Google Search Console:** Indexing, keywords, errors
- **Google Analytics:** Traffic, behavior, conversions
- **Lighthouse:** Performance & SEO scores
- **Semrush/Ahrefs:** Competitor analysis, keywords

### Key Metrics
- **Organic Traffic:** Month-over-month growth
- **Keyword Rankings:** Top 10 keywords tracked
- **Click-Through Rate (CTR):** Expected 2-5% from SERP
- **Bounce Rate:** Target < 50%
- **Pages/Session:** Target > 2.5

---

## Related Documentation

- [BRAND_GUIDELINES.md](../07-DESIGN/BRAND_GUIDELINES.md)
- [Performance Standards](./PERFORMANCE.md)
