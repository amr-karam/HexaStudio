# Server Structure: Local Staging

## Directory Layout
```text
/home/ubuntu/hexastudio/
├── .env                     # Environment secrets
├── docker-compose.yml       # Orchestration
├── .dockerignore            # Docker exclusion list
├── deploy-local.sh          # Automation script
├── healthcheck.sh           # Verification script
├── docker/
│   ├── nginx/               # Reverse proxy config
│   │   └── nginx.conf
│   ├── postgres/            # Database init scripts
│   ├── redis/               # Cache config
│   ├── minio/               # S3 storage config
│   └── traefik/             # Edge routing (optional for local)
├── apps/
│   ├── frontend/            # Next.js Application
│   ├── backend/             # NestJS API
│   └── cms/                 # Strapi CMS
└── packages/                # Shared TS types & utils
```

## Network Architecture
- **Internal Network (`hexa-internal`):** All services communicate via Docker DNS (e.g., `http://backend:4000`).
- **External Access:** Only the `nginx` service exposes port `80` to the host machine.
- **Storage:** Persistent volumes are used for Postgres and MinIO to prevent data loss on restart.
