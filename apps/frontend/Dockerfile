# Stage 1: Base
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Stage 2: Dependencies
# COPY from repo root so package-lock.json (with workspace resolution) is available.
FROM base AS deps
COPY package-lock.json package.json ./
COPY apps/frontend/package.json apps/frontend/
COPY apps/types/package.json apps/types/ 2>/dev/null || true
COPY apps/utils/package.json apps/utils/ 2>/dev/null || true
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Stage 3: Builder
FROM deps AS builder

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CMS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_OUTPUT_STANDALONE=true

# Copy full source for build
COPY . .

RUN npm run build --workspace=apps/frontend

# Stage 4: Runner
FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y wget curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build and static files
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend/server.js"]
