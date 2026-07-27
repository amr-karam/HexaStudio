# HEXA Studio — DATABASE CATALOG

> Version: 1.0 | Last Updated: 2026-07-26 | Authority: Backend Lead

## Overview

HEXA Vision uses four distinct data storage technologies, each serving a specific purpose:

| Database | Version | Purpose | Host | Port |
|----------|---------|---------|------|------|
| PostgreSQL | 16 (Alpine) | Relational data, business state, CMS content | Internal Docker network | 5432 |
| Redis | 7 (Alpine) | Caching, sessions, queues, rate limiting | Internal Docker network | 6379 |
| MinIO | Latest | Object storage for 3D models, renders, documents | Internal Docker network | 9000 |
| Qdrant | Latest | Vector storage for AI embeddings and semantic search | Internal Docker network | 6333 |

---

## 1. PostgreSQL

### 1.1 Overview

PostgreSQL 16 is the primary relational database, shared across three application domains. All databases run on the same PostgreSQL instance.

| Configuration | Value |
|---------------|-------|
| Image | `postgres:16-alpine` |
| Volume | `postgres_data` (`/var/lib/postgresql/data`) |
| Data disk | `/data/postgres` (100 GB SSD) |
| Max connections | 100 |
| Connection pooling | Application-level (not PgBouncer yet) |
| Port | 5432 (internal network only) |

### 1.2 Databases

#### 1.2.1 `hexa_backend` — NestJS Application Database

**Purpose**: Primary application database for the NestJS BFF. Stores users, authentication, contacts, application state, and cache.

**Key Tables**:

| Table | Purpose | Linked From |
|-------|---------|-------------|
| `users` | Application users (auth, roles, profiles) | Auth module |
| `contacts` | Website contact form submissions | CRM module |
| `projects_cache` | Cached project data from Odoo | Sync module |
| `milestones_cache` | Cached milestone data from Odoo | Sync module |
| `sessions` | User session data | Auth module |
| `audit_log` | Security and operation audit trail | Core module |
| `api_keys` | API key management | Auth module |
| `notifications` | User notifications | Notification module |
| `webhook_events` | Incoming webhook event log | Webhook module |
| `sync_state` | Odoo sync tracking (last sync, status) | Sync module |

**Key Indexes**:

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `users` | `idx_users_email` | UNIQUE B-tree | Email lookup |
| `users` | `idx_users_odoo_partner_id` | B-tree | Odoo link |
| `contacts` | `idx_contacts_email` | B-tree | Duplicate detection |
| `contacts` | `idx_contacts_created_at` | B-tree | Date-range queries |
| `audit_log` | `idx_audit_log_user_id` | B-tree | User audit trail |
| `audit_log` | `idx_audit_log_created_at` | B-tree | Time-based queries |
| `sync_state` | `idx_sync_state_model` | UNIQUE B-tree | Per-model sync tracking |

#### 1.2.2 `hexa_cms` — Strapi CMS Database

**Purpose**: Stores all marketing content for the Strapi 5 headless CMS.

**Key Tables**:

| Table | Purpose | Content Type |
|-------|---------|-------------|
| `portfolios` | Project portfolio entries | Portfolio |
| `portfolio_media` | Media attachments for portfolios | Media |
| `articles` | Blog articles | Article |
| `services` | Service offerings | Service |
| `categories` | Content categorization | Taxonomy |
| `tags` | Content tagging | Taxonomy |
| `media` | Media library assets | Media |
| `users-permissions_user` | CMS admin users | Auth |
| `menus` | Navigation menus | Config |
| `global` | Global site settings | Config |

**Key Indexes**:

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `portfolios` | `idx_portfolios_slug` | UNIQUE B-tree | URL slug lookup |
| `portfolios` | `idx_portfolios_status` | B-tree | Published/draft filter |
| `articles` | `idx_articles_slug` | UNIQUE B-tree | URL slug lookup |
| `articles` | `idx_articles_published_at` | B-tree | Date-ordered queries |
| `services` | `idx_services_slug` | UNIQUE B-tree | URL slug lookup |

#### 1.2.3 `hexa_odoo` — Odoo ERP Database

**Purpose**: Odoo 18 ERP database containing all business operations data.

**Key Tables**:

| Table | Purpose | Module |
|-------|---------|--------|
| `res_partner` | Contacts, clients, companies | Contacts |
| `res_users` | Odoo user accounts and permissions | Auth |
| `crm_lead` | Sales leads and opportunities | CRM |
| `crm_stage` | Pipeline stage definitions | CRM |
| `project_project` | Project records | Project |
| `project_task` | Project tasks and sub-tasks | Project |
| `project_milestone` | Project milestones (custom) | Project (hexa_studio) |
| `sale_order` | Sales orders and quotations | Sales |
| `sale_order_line` | Sales order line items | Sales |
| `account_move` | Invoices and accounting entries | Accounting |
| `account_move_line` | Invoice line items | Accounting |
| `hr_employee` | Employee records | HR |
| `calendar_event` | Calendar events and meetings | Calendar |
| `mail_message` | Internal messaging and notifications | Discuss |
| `mail_activity` | Scheduled activities and reminders | Discuss |
| `documents_document` | Document metadata | Documents |
| `ir_attachment` | File attachments and binary data | Base |
| `helpdesk_ticket` | Helpdesk support tickets | Helpdesk |
| `account_analytic_line` | Timesheet entries | Timesheets |
| `knowledge_article` | Knowledge base articles | Knowledge |
| `hexa_webhook_log` | Webhook dispatch audit log | hexa_studio |

**Custom Fields** (added by `hexa_studio` module):

| Model | Fields |
|-------|--------|
| `res_partner` | `x_hexa_client`, `x_hexa_source`, `x_hexa_website_user_id`, `x_hexa_project_ids` |
| `crm_lead` | `x_hexa_source`, `x_hexa_service`, `x_hexa_budget`, `x_hexa_referral_code`, `x_hexa_website_contact_id` |
| `project_project` | `x_slug`, `x_hexa_type`, `x_hexa_status`, `x_hexa_client_portal_active`, `x_hexa_budget_amount`, `x_hexa_milestone_ids` |
| `project_milestone` | `x_hexa_client_viewable`, `x_hexa_description`, `x_hexa_order` |

### 1.3 Cross-Database Relations

There is **no direct foreign key** between PostgreSQL databases. Cross-database relations are handled at the application layer:

| Relation | Via | Mechanism |
|----------|-----|-----------|
| Contact (backend) ↔ Partner (Odoo) | `x_hexa_website_user_id` | NestJS lookup |
| Portfolio (CMS) ↔ Project (Odoo) | `x_slug` field | Application join |
| User (backend) ↔ Employee (Odoo) | `email` field | Application match |
| User (backend) ↔ Partner (Odoo) | `x_hexa_website_user_id` | Odoo cached in backend |

### 1.4 Migration History Approach

| Type | Tool | Frequency | Process |
|------|------|-----------|---------|
| **NestJS Backend** | TypeORM migrations | Per feature | `npm run migration:generate` → review → commit → `npm run migration:run` in CI/CD |
| **Strapi CMS** | Strapi lifecycle hooks | Per content type change | Strapi admin UI → structure sync |
| **Odoo** | Odoo module updates | Per `hexa_studio` version | Module upgrade via Odoo UI or CLI |

**Migration Strategy**:
- All schema changes are code-reviewed before merging
- Rollback script must accompany each forward migration
- Staging database is restored from production weekly for migration testing
- Zero-downtime migrations preferred (add columns before removing)

### 1.5 Backup Policy

| Aspect | Configuration |
|--------|---------------|
| Tool | `pg_dump` (custom format, compression level 9) |
| Frequency | Every 6 hours |
| Retention | 30 days |
| Encryption | GPG AES256 symmetric |
| Storage | Local (`/backups/postgres/`) + S3-compatible offsite |
| Verification | Weekly restore to test environment |
| WAL archiving | Continuous, 7-day retention |
| PITR capability | Yes — base backup + WAL archive |

### 1.6 Point-in-Time Recovery

```bash
# 1. Restore base backup
pg_restore -U hexa -d hexa_backend --clean /backups/postgres/latest_base.dump

# 2. Configure recovery.conf
echo "restore_command = 'cp /wal_archive/%f %p'" > recovery.conf
echo "recovery_target_time = '2026-07-26 14:30:00 UTC'" >> recovery.conf

# 3. Start PostgreSQL in recovery mode
pg_ctl start -D /var/lib/postgresql/data

# 4. Verify data at target time
# 5. Promote to primary when satisfied
pg_ctl promote -D /var/lib/postgresql/data
```

### 1.7 Performance Notes

| Area | Configuration | Rationale |
|------|---------------|-----------|
| `shared_buffers` | 1 GB (25% of RAM) | Standard PostgreSQL recommendation |
| `effective_cache_size` | 3 GB (75% of RAM) | Assumes OS filesystem cache |
| `work_mem` | 16 MB | Adequate for typical query sorts |
| `maintenance_work_mem` | 256 MB | VACUUM, CREATE INDEX, pg_dump |
| `max_connections` | 100 | Conservative, connection pooling planned |
| `wal_level` | `replica` | Required for WAL archiving |
| `archive_mode` | `on` | Required for PITR |
| `random_page_cost` | 1.1 | SSD-optimized (default is 4.0 for HDD) |
| `effective_io_concurrency` | 200 | SSD can handle concurrent I/O |
| `autovacuum` | `on` | Prevent XID wraparound, bloat |
| `autovacuum_vacuum_scale_factor` | 0.01 | More aggressive vacuum on small tables |

---

## 2. Redis

### 2.1 Overview

| Configuration | Value |
|---------------|-------|
| Image | `redis:7-alpine` |
| Volume | `redis_data` (`/data`) |
| Port | 6379 (internal network only) |
| Max memory | 256 MB |
| Eviction policy | `allkeys-lru` (cache), `noeviction` (sessions) |
| Persistence | RDB every 5 minutes (session data only) |

### 2.2 Data Dictionary

| Key Pattern | Type | TTL | Purpose | Persistence |
|-------------|------|-----|---------|-------------|
| `session:{id}` | String | 24h | JWT session tokens | RDB |
| `cache:api:{path}` | String | 5-60m | API response cache | None |
| `cache:manifest:{id}` | String | 1h | 3D scene manifest cache | None |
| `cache:odoo:{model}:{id}` | Hash | 10m | Odoo record cache | None |
| `odoo:pending-leads` | List | Until processed | Queue of leads awaiting Odoo sync | RDB |
| `odoo:pending-webhooks` | List | Until processed | Queue of webhooks awaiting dispatch | RDB |
| `ratelimit:{ip}:{endpoint}` | String | Window | Rate limiting counters | None |
| `sync:lock:{model}` | String | 30s | Distributed sync lock | None |

### 2.3 Redis Use Cases

| Use Case | Mechanism | Fallback |
|----------|-----------|----------|
| **Caching** | Cache-aside pattern with TTL | Direct DB query on miss |
| **Sessions** | JWT stored in Redis for fast validation | DB lookup on Redis miss |
| **Queues** | List with blocking pop (BRPOP) | Polling on queue empty |
| **Rate limiting** | Sliding window counter | None (block request) |
| **Distributed locks** | SET NX EX for sync coordination | Timeout-based release |

### 2.4 Monitoring

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Used memory | > 85% of max | Warning |
| Hit rate | < 80% | Warning (inefficient caching) |
| Connected clients | > 100 | Warning |
| Rejected connections | > 0 | Critical (maxclients reached) |
| Keyspace misses | > 20% of total ops | Warning |

---

## 3. MinIO

### 3.1 Overview

| Configuration | Value |
|---------------|-------|
| Image | `minio/minio:latest` |
| Volume | `minio_data` (`/data`) |
| Data disk | `/data/minio` (500 GB SSD) |
| API Port | 9000 (internal) |
| Console Port | 9001 (internal) |
| Access policy | Signed URLs only (1h expiry) |

### 3.2 Buckets

| Bucket | Purpose | Access | Versioning |
|--------|---------|--------|------------|
| `hexa-studio` | Main application storage | Private (signed URLs) | No |
| `hexa-backups` | Backup storage for offsite replication | Private | Yes |

### 3.3 Object Hierarchy

```
hexa-studio/
├── projects/{project-uuid}/
│   ├── renders/            # Final rendered images (PNG, JPG, WebP)
│   ├── models/             # 3D models (GLB, GLTF, Draco-compressed)
│   ├── documents/          # PDFs, contracts, spreadsheets
│   ├── client-uploads/     # Client-submitted reference files
│   └── revisions/          # Iteration snapshots
├── cms/
│   ├── portfolio/          # Portfolio project cover images
│   ├── blog/               # Blog article imagery
│   └── services/           # Service page hero images
├── users/{user-uuid}/
│   └── avatars/            # User profile pictures
└── temp/
    └── uploads/            # Temporary staging area (24h auto-cleanup)
```

### 3.4 Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::hexa-studio/*",
      "Condition": {
        "IpAddress": {"aws:SourceIp": "172.16.0.0/12"}
      }
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::hexa-studio/*",
      "Principal": "*",
      "Condition": {
        "StringEquals": {"s3:signatureversion": "AWS4-HMAC-SHA256"}
      }
    }
  ]
}
```

### 3.5 Lifecycle Rules

| Prefix | Rule | Action |
|--------|------|--------|
| `temp/` | Delete after 24h | Expiration |
| `projects/*/revisions/` | Delete after 90 days | Expiration |

### 3.6 Backup

| Frequency | Method | Retention | Destination |
|-----------|--------|-----------|-------------|
| Daily | `mc mirror --overwrite` | 7 days local, 30 days offsite | S3-compatible |

---

## 4. Qdrant

### 4.1 Overview

| Configuration | Value |
|---------------|-------|
| Image | `qdrant/qdrant:latest` |
| Volume | `qdrant_storage` (`/qdrant/storage`) |
| Port | 6333 (internal network) |
| Memory limit | 2 GB |
| CPU limit | 1.0 vCPU |

### 4.2 Collections

| Collection | Vector Size | Distance | Payload | Purpose |
|------------|-------------|----------|---------|---------|
| `projects` | 1536 | Cosine | project_id, name, type, status, description | Project semantic search |
| `portfolio` | 1536 | Cosine | portfolio_id, slug, title, tags | Portfolio content search |
| `knowledge` | 1536 | Cosine | article_id, title, content, category | Knowledge base search |

### 4.3 Data Flow

```
Strapi/Odoo content created/updated
    │
    ▼
NestJS: EmbeddingService
    │
    ├── Generate embedding (OpenAI/Gemini text-embedding-3, 1536d)
    ├── Upsert to Qdrant collection
    └── Log to audit trail
            │
            ▼
Query → EmbeddingService → Qdrant search → Return top-k results
```

### 4.4 Indexing Strategy

- **HNSW index**: `m=16`, `ef_construct=100` (balanced between speed and accuracy)
- **Payload index**: On `project_id`, `type`, `status` for filtered searches
- **Quantization**: Disabled (full precision for highest accuracy)

### 4.5 Monitoring

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Search p95 latency | > 1s | Warning |
| Error rate | > 1% | Critical |
| Collection size | > 80% of allocated storage | Warning |
| Indexing lag | > 1 min behind | Warning |

---

## 5. Database Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER HOST                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              INTERNAL NETWORK (172.16.x.x)              │ │
│  │                                                         │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐ │ │
│  │  │  PostgreSQL  │   │    Redis    │   │    MinIO     │ │ │
│  │  │    :5432     │   │    :6379    │   │    :9000     │ │ │
│  │  └──────┬──────┘   └─────────────┘   └──────────────┘ │ │
│  │         │                                               │ │
│  │  ┌──────┴──────────────────────────────────────────┐   │ │
│  │  │         ┌──────────┐  ┌──────────┐  ┌────────┐  │   │ │
│  │  │         │ hexa_    │  │ hexa_    │  │ hexa_  │  │   │ │
│  │  │         │ backend  │  │ cms      │  │ odoo   │  │   │ │
│  │  │         └──────────┘  └──────────┘  └────────┘  │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  │                                                         │ │
│  │  ┌────────────────────┐                                 │ │
│  │  │      Qdrant        │                                 │ │
│  │  │    :6333           │                                 │ │
│  │  │  ┌──────────────┐  │                                 │ │
│  │  │  │ projects     │  │                                 │ │
│  │  │  │ portfolio    │  │                                 │ │
│  │  │  │ knowledge    │  │                                 │ │
│  │  │  └──────────────┘  │                                 │ │
│  │  └────────────────────┘                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 6. Connection Strings

All databases are accessed via internal Docker service names:

| Database | Service Name | Connection String Pattern |
|----------|-------------|--------------------------|
| PostgreSQL (backend) | `postgres` | `postgresql://hexa:${PASSWORD}@postgres:5432/hexa_backend` |
| PostgreSQL (cms) | `postgres` | `postgresql://hexa:${PASSWORD}@postgres:5432/hexa_cms` |
| PostgreSQL (odoo) | `postgres` | `postgresql://hexa:${PASSWORD}@postgres:5432/hexa_odoo` |
| Redis | `redis` | `redis://:${PASSWORD}@redis:6379/0` |
| MinIO | `minio` | `http://minio:9000` (API) |
| Qdrant | `qdrant` | `http://qdrant:6333` |

## 7. Backup Strategy Summary

| Database | Method | Frequency | Retention | RPO | RTO |
|----------|--------|-----------|-----------|-----|-----|
| PostgreSQL | pg_dump (custom) + WAL | Every 6h + continuous | 30 days | < 15 min | < 1h |
| Redis | RDB snapshots | Every 5 min | 24h | < 5 min | < 5 min |
| MinIO | mc mirror | Daily | 7 days local, 30 days offsite | < 1 day | < 2h |
| Qdrant | Snapshot API | Daily | 7 days | < 1 day | < 1h |

---

## Related Documents

- [System Architecture](./SYSTEM_ARCHITECTURE.md) — High-level topology
- [Backup & Restore](../13-DEVOPS/BACKUP.md) — Detailed backup procedures
- [Disaster Recovery](../13-DEVOPS/DISASTER_RECOVERY.md) — DR scenarios
- [Database Standards](../06-STANDARDS/DATABASE_STANDARDS.md) — Coding standards for DB access
- [Infrastructure Governance](../13-DEVOPS/INFRASTRUCTURE_GOVERNANCE.md) — Infrastructure policies
