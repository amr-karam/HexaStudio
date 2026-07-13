# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/types/package.json ./packages/types/
RUN npm install --workspace=@hexa-hub/worker --include-workspace-root

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps/worker ./apps/worker
COPY packages/types ./packages/types
RUN npm run build --workspace=@hexa-hub/worker

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/worker/dist ./apps/worker/dist
COPY --from=build /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=build /app/packages/types ./packages/types

WORKDIR /app/apps/worker
CMD ["node", "dist/index.js"]
