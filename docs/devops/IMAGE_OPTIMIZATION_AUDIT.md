# Image Optimization Audit

## Overview
Audit checklist and configuration for Next.js image optimization in HEXA Studio.

## Current Configuration

### Next.js Image Settings (`next.config.ts`)
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "*.unsplash.com" },
    { protocol: "https", hostname: "storage.hexastudio.net" },
    { protocol: "https", hostname: "*.hexastudio.net" },
    { protocol: "https", hostname: "minio.*" },
  ],
}
```

### Current Usage Patterns
- `<Image>` component from `next/image` used throughout
- Priority loading for above-fold images
- Blur placeholders for smooth loading
- Responsive sizes with `sizes` prop

## Audit Checklist

### 1. Format Optimization
- [ ] All images served as WebP/AVIF
- [ ] Fallback to JPEG/PNG for unsupported browsers
- [ ] AVIF support enabled (better compression than WebP)

### 2. Sizing & Responsiveness
- [ ] `sizes` prop set for all images
- [ ] No layout shift (CLS < 0.1)
- [ ] Proper `width`/`height` or `fill` with aspect ratio
- [ ] Responsive breakpoints: 640, 768, 1024, 1280, 1536

### 3. Loading Strategy
- [ ] Above-fold: `priority=true`
- [ ] Below-fold: `loading="lazy"`
- [ ] Blur placeholder for all images
- [ ] LQIP (Low Quality Image Placeholder) for hero images

### 4. Format Configuration
```typescript
// next.config.ts additions
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
```

### 5. MinIO/S3 Optimization
- [ ] Enable automatic WebP conversion on upload
- [ ] Configure MinIO bucket lifecycle for old versions
- [ ] CDN caching headers: `Cache-Control: public, max-age=31536000, immutable`

## Component Patterns

### Hero Images
```tsx
<Image
  src={heroImage}
  alt="Project hero"
  fill
  priority
  sizes="100vw"
  className="object-cover"
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### Gallery/Grid Images
```tsx
<Image
  src={project.coverImage}
  alt={project.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  placeholder="blur"
  blurDataUrl={blurDataUrl}
/>
```

### 3D Model Posters
```tsx
<Image
  src={model.poster}
  alt={model.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

## Automated Audit (CI)

### Image Size Check Script
```bash
# scripts/audit-images.sh
#!/bin/bash
MAX_SIZE_KB=500
FAILED=0

find apps/frontend/public -name "*.jpg" -o -name "*.png" -o -name "*.webp" | while read file; do
  SIZE=$(stat -c%s "$file")
  SIZE_KB=$((SIZE / 1024))
  if [ $SIZE_KB -gt 500 ]; then
    echo "⚠️  $file: ${SIZE_KB}KB (max 500KB)"
    FAILED=1
  fi
done

if [ $FAILED -eq 1 ]; then
  exit 1
fi
```

### CI Integration
```yaml
# .github/workflows/image-audit.yml
name: Image Optimization Audit
on:
  pull_request:
    paths:
      - 'apps/frontend/public/**'
      - 'apps/frontend/src/**/*.tsx'

jobs:
  image-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check image sizes
        run: |
          ./scripts/audit-images.sh
      - name: Check for missing alt text
        run: |
          grep -r '<Image' apps/frontend/src --include="*.tsx" | \
            grep -v 'alt=' && exit 1 || true
      - name: Check for missing width/height
        run: |
          grep -r '<Image' apps/frontend/src --include="*.tsx" | \
            grep -v 'width=' | grep -v 'height=' | grep -v 'fill' && exit 1 || true
```

## Image Optimization Pipeline

### Build-time (Next.js)
1. Next.js Image Optimization API serves optimized images on-demand
2. Cached in `.next/cache/images/`
3. Served with proper headers

### Upload-time (MinIO)
```bash
# Auto-convert to WebP on upload
mc alias set local http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
mc cp image.jpg local/hexa-studio/projects/
# Next.js will serve WebP/AVIF automatically
```

### CDN (Cloudflare)
```nginx
# Cloudflare Workers for image optimization
add_header Cache-Control "public, max-age=31536000, immutable";
add_header Content-Type "image/webp";
# Polish: Auto WebP, Auto AVIF, Compression: Lossless
```

## Audit Results Template

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Largest Contentful Paint (LCP) | < 2.5s | - | - |
| Cumulative Layout Shift (CLS) | < 0.1 | - | - |
| Image Weight (total) | < 500KB/page | - | - |
| WebP/AVIF Coverage | 100% | - | - |
| Lazy Load Coverage | 100% below fold | - | - |
| Missing Alt Text | 0 | - | - |
| Missing Width/Height | 0 | - | - |

## Action Items
- [ ] Add `formats: ['image/avif', 'image/webp']` to next.config.ts
- [ ] Add `deviceSizes` and `imageSizes` arrays
- [ ] Enable `minimumCacheTTL: 31536000`
- [ ] Add CI image audit workflow
- [ ] Configure MinIO auto WebP conversion
- [ ] Set up Cloudflare Polish for automatic optimization
- [ ] Add image size audit to CI pipeline
- [ ] Document blur placeholder generation process

## Tools
- `next build && next start` - Test production build
- `npm run analyze` - Bundle analyzer (includes image sizes)
- Lighthouse CI - Automated performance audits
- WebPageTest - Real-world performance testing