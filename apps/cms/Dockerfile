# --- Single Stage Build ---
FROM node:22
RUN apt-get update && apt-get install -y build-essential gcc g++ make python3 curl
WORKDIR /app
COPY . .
RUN npm install --no-audit --no-fund
RUN npm install esbuild react-redux --legacy-peer-deps --no-audit --no-fund
RUN npm run build --workspace=apps/cms
ENV NODE_ENV=production
WORKDIR /app/apps/cms
EXPOSE 1337
CMD ["npm", "run", "start"]
