# HEXA STUDIO Design System Docs (Storybook) — docs-service image
# Serves the static Storybook build on port 8080 (Traefik docs router:
#   Host(`docs.hexastudio.net`) -> docs-service:8080)
# Build context must include packages/ui/storybook-static/ (produced by the
# `build-storybook` CI job or locally via `npm run build-storybook`).

FROM nginx:1.27-alpine

# Serve Storybook static files. nginx serves on 80 by default; we map the
# container's published port to 8080 via config so it matches Traefik's
# `docs-service:8080` load balancer target.
COPY packages/ui/storybook-static/ /usr/share/nginx/html/

# Minimal nginx config: SPA-style fallback to index.html, gzip for static assets.
COPY docker/docs/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
