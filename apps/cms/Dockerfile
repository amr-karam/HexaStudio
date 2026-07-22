# CMS (Strapi 5) standalone build
FROM node:20 AS base
WORKDIR /opt/app
COPY apps/cms/package.json ./package.json
COPY apps/cms/package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY apps/cms/ ./
ENV NODE_ENV=development
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
