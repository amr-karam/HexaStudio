# SEO Checklist

---

## On-Page SEO

- [ ] Every page has a unique `<title>` (50-60 chars)
- [ ] Every page has a unique `<meta name="description">` (150-160 chars)
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] Only one H1 per page
- [ ] Content uses semantic HTML
- [ ] Internal links use descriptive anchor text
- [ ] External links use `rel="noopener noreferrer"`

## Technical SEO

- [ ] Canonical URL on every page (self-referencing)
- [ ] `robots.txt` configured
- [ ] XML sitemap generated dynamically
- [ ] Sitemap submitted to Google Search Console
- [ ] `noindex` on admin/dashboard pages
- [ ] `index` on all public pages
- [ ] 404 page returns proper 404 status
- [ ] Redirects for moved pages (301)

## Performance SEO

- [ ] LCP < 1.2s
- [ ] CLS < 0.1
- [ ] Mobile-friendly (responsive)
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts optimized (WOFF2, subset, swap)

## Structured Data (JSON-LD)

- [ ] Organization schema on all pages
- [ ] Project schema on project pages
- [ ] BlogPosting schema on blog pages
- [ ] Service schema on service pages
- [ ] BreadcrumbList schema on content pages
- [ ] LocalBusiness schema (if applicable)
- [ ] Structured data validates with Google's tool

## Open Graph

- [ ] `og:title` on every page
- [ ] `og:description` on every page
- [ ] `og:image` on every page (1200x630px recommended)
- [ ] `og:url` on every page
- [ ] `og:type`: website for home, article for blog
- [ ] `og:site_name`: "HEXA Studio"

## Twitter Cards

- [ ] `twitter:card`: summary_large_image
- [ ] `twitter:title` matches og:title
- [ ] `twitter:description` matches og:description
- [ ] `twitter:image` matches og:image

## Content

- [ ] No thin content pages (< 300 words)
- [ ] No duplicate content
- [ ] Keywords in title, headings, and body
- [ ] Alt text on all images (descriptive, not keyword-stuffed)
- [ ] Blog posts have publish date and author

## Mobile SEO

- [ ] Responsive design (no separate mobile site)
- [ ] Touch targets ≥ 48px
- [ ] Font size ≥ 16px (prevents zoom)
- [ ] No interstitials that block content

## Monitoring

- [ ] Google Search Console verified
- [ ] Google Analytics 4 configured
- [ ] Search Console errors checked weekly
- [ ] Crawl stats monitored
- [ ] Backlink profile healthy
