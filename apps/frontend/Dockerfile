# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

# Stage 2: Builder
FROM base AS builder

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CMS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

COPY . .
WORKDIR /app
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
RUN npm install --no-audit --no-fund --legacy-peer-deps && npm run build --workspace=apps/frontend

# Stage 3: Runner
FROM node:20-alpine AS runner
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
