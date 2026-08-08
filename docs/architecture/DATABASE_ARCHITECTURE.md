# Database Architecture

**Version:** 1.0 | **Status:** Active  
**Scope:** PostgreSQL 16, schema design, data modeling, migrations, queries, performance, security, backup & recovery

---

## 1. Database Overview

HEXA STUDIO uses PostgreSQL 16 as its primary relational database. It is chosen for reliability, extensibility, and performance.

### 1.1 Database Role

- Primary data store for all business data
- Enforces data integrity through constraints, foreign keys, and transactions
- Executes complex queries with joins, aggregations, and filters
- Manages concurrent access through MVCC
- Ensures data consistency through constraints and transactions

### 1.2 Architecture Position

Frontend (Next.js) → NestJS BFF (Backend) → PostgreSQL 16 (Primary Database)

---

## 2. Schema Architecture

### 2.1 Design Principles

- Normalization to 3NF
- Consistent naming conventions
- Integrity through foreign keys, constraints, checks
- Performance through appropriate indexes
- Extensibility without breaking changes
- Auditability: createdAt, updatedAt, createdBy, updatedBy

### 2.2 Naming Conventions

- Tables: lowercase, snake_case, plural (projects, clients, team_members)
- Columns: lowercase, snake_case, singular (project_id, created_at, is_published)
- Primary keys: id (uuid or serial)
- Foreign keys: <referenced_table>_id (project_id, client_id)
- Junction tables: <table1>_<table2> (alphabetical, project_tags)
- Indexes: <table_name>_<column_name>_idx (projects_slug_idx)
- Constraints: <table_name>_<constraint_type>_<column_name> (projects_slug_unique)

### 2.3 Schema Organization

- Core: projects, clients, team_members, services, categories, tags
- Content: blog_posts, testimonials, faqs, navigations, global_settings
- Users: users, roles, permissions, sessions
- Projects: projects, project_members, project_tasks, project_milestones
- Client: clients, client_contacts, client_projects
- Leads: leads, lead_sources, lead_statuses
- Files: files, file_tags, file_projects
- Comments: comments, comment_replies, comment_keywords
- Notifications: notifications, notification_preferences
- Audit: audit_logs, audit_log_details
- Settings: settings, setting_groups

---

## 3. Data Modeling Architecture

### 3.1 Entity Relationships

Key entities: Project, Client, Team Member, Service, Category, Tag, Testimonial, Blog Post, FAQ, User, Lead, Notification, Audit Log.

Relationships: Project belongs to Client (client_id); has many Team Members (project_members junction); has many Tags (project_tags junction); belongs to Category; has SEO. Client has many Projects. Team Member has many Projects (project_members junction). Service has many Projects (project_services junction). Category has many Projects. Tag has many Projects (project_tags junction).

### 3.2 Data Types

- uuid: Primary keys (preferred for distributed systems)
- serial: Auto-incrementing integers
- varchar(n): Variable-length strings with max
- text: Variable-length strings without max
- integer, bigint: Integer values
- decimal(p,s): Exact numeric values (currency)
- boolean: True/false values
- date: Date values
- timestamp/timestamptz: Date and time values (timestamptz preferred)
- json/jsonb: JSON data (jsonb preferred for querying)
- array: Arrays of values
- enum: Enumerated values
- citext: Case-insensitive text
- tsvector: Full-text search vectors
- bytea: Binary data

### 3.3 Constraints

- PRIMARY KEY — Unique identifier (id uuid PRIMARY KEY DEFAULT gen_random_uuid())
- FOREIGN KEY — Referential integrity (client_id uuid REFERENCES clients(id) ON DELETE SET NULL)
- UNIQUE — Uniqueness (slug varchar(200) UNIQUE)
- NOT NULL — Not null (title varchar(200) NOT NULL)
- CHECK — Condition (year integer CHECK (year >= 1900 AND year <= 2100))
- DEFAULT — Default value (is_published boolean DEFAULT true)

### 3.4 Indexes

- B-tree: Default for equality and range queries
- Unique: Enforces uniqueness (CREATE UNIQUE INDEX projects_slug_unique ON projects(slug))
- Composite: Multiple columns (CREATE INDEX projects_client_year_idx ON projects(client_id, year))
- Partial: Subset of rows (CREATE INDEX projects_published_idx ON projects(published_at) WHERE published_at IS NOT NULL)
- Expression: Index on expression (CREATE INDEX projects_lower_title_idx ON projects(LOWER(title)))
- Full-text search: GIN index (CREATE INDEX projects_search_idx ON projects USING GIN(to_tsvector('english', title || ' ' || description)))

### 3.5 JSON/JSONB Usage

JSONB is used for flexible, schema-less data: component data (flexible component data like credits, stats), metadata (extensible metadata), configuration (flexible configuration data), tags (array of tags).

---

## 4. Migration Architecture

### 4.1 Migration Strategy

- Versioned migrations (each migration has version number and timestamp)
- Incremental changes (small, incremental changes)
- Rollback support (each migration has rollback migration)
- Idempotency (migrations can be run multiple times safely)
- Testing (migrations tested in dev and staging before production)

### 4.2 Migration Tools

- Prisma (ORM with migration support, if used)
- Knex.js (SQL query builder with migration support, if used)
- Flyway (database migration tool, if used)
- Liquibase (database migration tool, if used)
- Custom migrations (custom migration scripts, if needed)

### 4.3 Migration Process

1. Create migration (generate new migration file with unique version number)
2. Write up migration (SQL to apply the change)
3. Write down migration (SQL to rollback the change)
4. Test migration (run in development environment)
5. Test rollback (run rollback in development environment)
6. Review (correctness, performance, safety)
7. Deploy (run in staging, then production)
8. Verify (verify migration was successful)

### 4.4 Migration Categories

- Schema changes: Adding/modifying tables, columns, constraints
- Data changes: Modifying existing data
- Index changes: Adding/removing/modifying indexes
- Constraint changes: Adding/removing/modifying constraints
- Seed data: Adding initial data

---

## 5. Query Architecture

### 5.1 Query Patterns

- Simple select: SELECT * FROM projects WHERE slug = $1
- Filtered select: SELECT * FROM projects WHERE year >= 2020 AND published_at IS NOT NULL
- Joined select: SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON p.client_id = c.id
- Aggregated select: SELECT client_id, COUNT(*) AS project_count FROM projects GROUP BY client_id
- Paginated select: SELECT * FROM projects ORDER BY created_at DESC LIMIT 25 OFFSET 0
- Sorted select: SELECT * FROM projects ORDER BY published_at DESC

### 5.2 Query Optimization

- Select only needed columns (avoid SELECT *)
- Use appropriate indexes
- Avoid N+1 queries (use joins or batch queries)
- Limit result sets
- Use pagination for large result sets
- Use EXPLAIN to analyze query plans
- Use prepared statements (prevent SQL injection, improve performance)

### 5.3 N+1 Prevention

- Joins (fetch related data in single query)
- Batch queries (fetch related data in batches)
- Eager loading (load related data upfront)
- DataLoader pattern (batch and cache related data fetches in application code)

---

## 6. Connection Architecture

### 6.1 Connection Pooling

- Pool size: Configured based on expected concurrency (10-50 connections per instance)
- Connection timeout: Idle connections closed
- Maximum lifetime: Connections recycled after maximum lifetime
- Health checks: Regular health checks ensure connections are valid

### 6.2 Connection Management

- Connection string: Stored securely (environment variables, secrets manager)
- Connection timeout: Configured to fail fast
- Retry logic: Retry failed connections with exponential backoff
- Circuit breaker: Open circuit breaker when database unavailable

### 6.3 Multi-Instance Considerations

- Each instance has its own connection pool
- Total connections = pool size × number of instances
- Database connection limits (ensure database can handle total connections)
- PgBouncer (consider for connection pooling at database level)

---

## 7. Performance Architecture

### 7.1 Indexing Strategy

- Primary key indexes (automatically created)
- Foreign key indexes (created for foreign key columns)
- Unique indexes (created for unique constraints)
- Query indexes (created for columns used in WHERE, ORDER BY, JOIN conditions)
- Composite indexes (created for queries filtering on multiple columns)
- Full-text search indexes (created for columns used in full-text search)

### 7.2 Query Optimization

- Query analysis (EXPLAIN ANALYZE)
- Index usage (ensure queries use indexes)
- Query refactoring (refactor inefficient queries)
- Caching (cache frequently accessed data in Redis)
- Read replicas (use read replicas for read-heavy workloads if needed)

### 7.3 Performance Monitoring

- Query performance (slow query logs, query performance metrics)
- Connection performance (connection pool usage, connection times)
- Resource usage (CPU, memory, disk I/O, network I/O)
- Table/index statistics (table sizes, index sizes, bloat)
- Lock monitoring (lock contention, deadlocks)

---

## 8. Security Architecture

### 8.1 Access Control

- Authentication (database users authenticate with username and password)
- Authorization (database users have specific permissions: SELECT, INSERT, UPDATE, DELETE)
- Role-based access (database roles define permissions for different types of users)
- Least privilege (database users have only permissions they need)

### 8.2 Encryption

- Encryption at rest (filesystem encryption, TDE if available)
- Encryption in transit (all database connections use TLS/SSL)
- Column-level encryption (sensitive data encrypted at column level)

### 8.3 Auditing

- Audit logs (key operations logged: CREATE, UPDATE, DELETE on sensitive tables)
- Access logs (database connections and queries logged)
- Change tracking (createdAt, updatedAt, createdBy, updatedBy)
- Compliance (audit logs support compliance requirements)

### 8.4 Data Protection

- PII protection (personally identifiable information protected)
- Password hashing (passwords hashed with bcrypt or argon2)
- Data minimization (only necessary data collected and stored)
- Data retention (data retained only as long as necessary)

---

## 9. Backup & Recovery Architecture

### 9.1 Backup Strategy

- Full backup (daily, 30 days retention, pg_dump -Fc)
- WAL archives (continuous, 7 days retention, point-in-time recovery)
- Media backup (daily, 30 days retention, media files backed up to S3)

### 9.2 Backup Implementation

- pg_dump (full database backups, custom format for flexibility)
- WAL archiving (write-ahead logs archived for point-in-time recovery)
- Media backups (media files backed up separately, volume backups, S3)
- Backup verification (backups verified regularly, test restores)

### 9.3 Recovery Process

1. Identify recovery point
2. Restore full backup
3. Apply WAL archives up to desired point in time
4. Verify recovery (database consistent, data intact)
5. Update application (configuration points to restored database)

### 9.4 RPO and RTO

- RPO (Recovery Point Objective): 24 hours (maximum acceptable data loss)
- RTO (Recovery Time Objective): 4 hours (maximum acceptable recovery time)

---

## 10. Data Lifecycle Architecture

### 10.1 Data Retention

- Active data: Indefinite (data currently in use)
- Inactive data: 2 years (data no longer actively used but retained for reference)
- Historical data: 7 years (historical data retained for compliance)
- Audit logs: 1 year (audit logs retained for security and compliance)
- Session data: 30 days (session data retained for 30 days)
- Temporary data: 24 hours (temporary data retained for 24 hours)

### 10.2 Data Archiving

- Archival process (inactive data moved to archive storage)
- Archive storage (cheaper, slower storage for archived data)
- Archive retrieval (archived data can be retrieved when needed)
- Archive retention (archived data retained according to retention policies)

### 10.3 Data Purging

- Purge process (data permanently deleted according to retention policies)
- Purge scheduling (purge jobs run on schedule)
- Purge verification (purge operations verified)
- Purge logging (purge operations logged for audit)

---

## 11. Replication & High Availability

### 11.1 Replication (if applicable)

- Streaming replication (primary replicates to standby servers)
- Synchronous replication (for critical data, ensures no data loss)
- Asynchronous replication (for non-critical data, improves performance)
- Read replicas (read queries distributed to read replicas)

### 11.2 High Availability (if applicable)

- Primary-standby (primary with standby servers)
- Automatic failover (standby promoted to primary if primary fails)
- Health checks (regular health checks ensure database available)
- Connection pooling (PgBouncer provides connection pooling and failover)

---

## 12. Multi-Tenant Architecture (if applicable)

### 12.1 Multi-Tenancy Strategies

- Database per tenant (highest isolation)
- Schema per tenant (good isolation)
- Shared database, shared schema (lowest isolation, highest efficiency)

### 12.2 Tenant Isolation

- Database per tenant (complete isolation, separate backups, separate security)
- Schema per tenant (good isolation, shared database resources, separate backups)
- Shared database, shared schema (tenant data separated by tenant_id column, least isolation)

### 12.3 Tenant Management

- Tenant provisioning (new tenants provisioned, database/schema created, configured)
- Tenant deprovisioning (tenants deprovisioned, data archived, resources released)
- Tenant routing (requests routed to correct tenant's data)

---

## 13. References

### Internal

- `docs/architecture/README.md` — Architecture manifest
- `docs/architecture/SYSTEM_ARCHITECTURE.md` — System architecture
- `docs/architecture/SERVICE_CATALOG.md` — Service catalog
- `docs/architecture/DOMAIN_MODEL.md` — Domain model
- `docs/architecture/DATA_FLOW.md` — Data flow
- `docs/adr/` — Architecture Decision Records
- `apps/backend/` — Backend application

### External

- PostgreSQL Documentation
- PostgreSQL Performance Documentation
- OWASP Database Security
- NIST SSDF
