# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
RUN npm install --workspace=@hexa-hub/web --include-workspace-root

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps/web ./apps/web
COPY packages/types ./packages/types

ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ARG NEXT_PUBLIC_REALTIME_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_REALTIME_URL=$NEXT_PUBLIC_REALTIME_URL

RUN npm run build --workspace=@hexa-hub/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=build /app/packages/types ./packages/types

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "start"]
