# Cloudflare Edge Cache Configuration

**Version:** 1.0 | **Scope:** CDN caching | **Standard:** ISR + Cache Everything

## 1. Architecture

Traffic flows: User → Cloudflare Edge → Tunnel → Origin (Docker/Traefik).

Cloudflare edge caches HTML responses based on `Cache-Control` / `Surrogate-Control` headers
emitted by Next.js, and serves cached content directly from the edge without hitting the origin.

## 2. Cache Headers (next.config.ts)

| Path | Cache-Control | Surrogate-Control | TTL |
|------|---------------|-------------------|-----|
| `/_next/static/*` | `public, max-age=31536000, immutable` | — | 1 year |
| `/`, `/projects`, `/blog`, `/about`, etc. | `public, s-maxage=3600, stale-while-revalidate=86400` | `public, max-age=3600` | 1 hour (edge), 24h SWR |
| All other paths | `no-cache` (security headers only) | — | No edge cache |

## 3. Cloudflare Cache Rule (Dashboard)

Configure in Cloudflare Dashboard → Rules → Cache Rules:

### Rule: "HEXA ISR Cache Everything"
- **When:** Hostname equals `hexastudio.net` AND NOT path starts with `/_next/static/`
- **Then:**
  - Cache eligibility: Eligible for cache
  - Edge TTL: Override (use origin header)
  - Browser TTL: Override (use origin header)

This ensures Cloudflare respects the `s-maxage` headers from Next.js.

## 4. Purge on Deploy

The deploy script (`scripts/deploy-zero-downtime.sh`) automatically purges the entire
Cloudflare edge cache after deploying to the new slot and triggering ISR revalidation.

**Prerequisites:**
- `CLOUDFLARE_EMAIL` — Cloudflare account email
- `CLOUDFLARE_API_KEY` — Cloudflare Global API Key
- `CLOUDFLARE_ZONE_ID` — Zone ID for hexastudio.net

**Flow:**
1. Deploy new slot (blue→green or green→blue)
2. Wait for health check
3. Remove old slot
4. Trigger ISR revalidation (`POST /api/revalidate`)
5. Purge Cloudflare edge cache (`DELETE /client/v4/zones/{id}/purge_cache`)

## 5. Cache Behavior

- **First request:** Origin serves fresh HTML, Cloudflare caches for 3600s (1h)
- **Subsequent requests (< 1h):** Cloudflare serves from edge cache
- **Stale-while-revalidate (1h–25h):** Cloudflare serves stale HTML while revalidating in background
- **After deploy:** Deploy script purges entire cache + triggers ISR revalidation
