# --- Stage 1: Base ---
FROM node:22 AS base
RUN apt-get update && apt-get install -y build-essential gcc g++ make python3
WORKDIR /app

# --- Stage 2: Builder ---
FROM base AS builder
COPY . .
RUN npm install --no-audit --no-fund
RUN npm install esbuild react-redux --legacy-peer-deps --no-audit --no-fund
RUN npm run build --workspace=apps/cms

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app/apps/cms
ENV NODE_ENV=production
COPY --from=builder /app/apps/cms/dist ./dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/apps/cms/package.json ./package.json
RUN mkdir -p /app/apps/cms/public/uploads
COPY --from=builder /app/apps/cms/public ./public
COPY --from=builder /app/apps/backend/package.json /app/apps/backend/package.json
COPY --from=builder /app/apps/frontend/package.json /app/apps/frontend/package.json
COPY --from=builder /app/packages/types/package.json /app/packages/types/package.json
COPY --from=builder /app/packages/utils/package.json /app/packages/utils/package.json

EXPOSE 1337
CMD ["npm", "run", "start"]
