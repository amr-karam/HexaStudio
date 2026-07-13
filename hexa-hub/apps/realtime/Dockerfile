# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY apps/realtime/package.json ./apps/realtime/
RUN npm install --workspace=@hexa-hub/realtime --include-workspace-root

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps/realtime ./apps/realtime
RUN npm run build --workspace=@hexa-hub/realtime

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/realtime/dist ./apps/realtime/dist
COPY --from=build /app/apps/realtime/package.json ./apps/realtime/package.json

WORKDIR /app/apps/realtime
EXPOSE 3001
CMD ["node", "dist/index.js"]
