FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p apps/backend/dist && cp -r packages apps/backend/dist/ 2>/dev/null; \
    cd apps/backend && npx nest build

FROM base AS runner
ENV NODE_ENV production
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/packages/utils ./packages/utils
COPY --from=builder /app/apps/backend/tsconfig.build.json ./apps/backend/tsconfig.build.json 2>/dev/null || true

EXPOSE 4000
CMD ["npm", "run", "start", "--workspace=apps/backend"]
