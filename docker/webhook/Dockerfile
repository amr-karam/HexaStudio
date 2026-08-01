FROM node:20-alpine

WORKDIR /app
COPY server.js .

USER node
EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:9000/health || exit 1

CMD ["node", "server.js"]
