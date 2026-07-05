# --- Base Image ---
FROM node:22
WORKDIR /app

# --- Environment ---
ENV NODE_ENV production

# --- Copy Pre-built Assets ---
COPY apps/backend/dist ./apps/backend/dist
COPY node_modules ./node_modules
COPY package.json ./package.json
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/cms/package.json ./apps/cms/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/utils/package.json ./packages/utils/package.json

EXPOSE 4000
CMD ["npm", "run", "start", "--workspace=apps/backend"]
