# 🗃️ Database Standards

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Database:** PostgreSQL

## Schema Design Principles

### 1. **Normalization**
- Use 3NF (Third Normal Form) as baseline
- Denormalize strategically for performance
- Document all denormalization decisions

### 2. **Naming Conventions**
```sql
Tables:       snake_case (plural)      - users, projects, project_files
Columns:      snake_case               - user_id, created_at, email_verified
Primary Keys: id (bigint, auto-inc)   - Always present
Foreign Keys: {table}_id               - projects.user_id references users.id
Indexes:      idx_{table}_{column}     - idx_users_email
Constraints:  ck_{table}_{name}        - ck_users_age_positive
```

### 3. **Timestamp Columns**
Every table should include:
```sql
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## Column Types

| Type | Use Case | Example |
|------|----------|---------|
| `bigint` | IDs, counts | user_id, view_count |
| `uuid` | Unique identifiers | trace_id, request_id |
| `text` | Long strings | descriptions, content |
| `varchar(n)` | Fixed-length strings | email, username |
| `boolean` | Flags | is_active, is_deleted |
| `json` | Flexible data | metadata, config |
| `timestamp` | Dates & times | created_at, updated_at |
| `numeric(p,s)` | Money | price, discount |

---

## Relationships & Constraints

### Foreign Keys
```sql
ALTER TABLE projects ADD CONSTRAINT fk_projects_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Check Constraints
```sql
ALTER TABLE orders ADD CONSTRAINT ck_orders_total_positive
  CHECK (total > 0);
```

### Unique Constraints
```sql
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
```

---

## Indexing Strategy

### Primary Indexes (Always Create)
- Primary key: `CREATE INDEX idx_{table}_id ON {table}(id);`
- Foreign keys: `CREATE INDEX idx_{table}_{fk}_id ON {table}({fk}_id);`
- Search fields: `CREATE INDEX idx_{table}_{column} ON {table}({column});`

### Performance Indexes
- High-cardinality columns
- Frequently filtered/sorted columns
- Columns in WHERE/ORDER BY clauses

### Avoid Over-Indexing
- More indexes = slower writes
- Review indexes quarterly
- Drop unused indexes

---

## Query Performance

### Best Practices

✅ Use `EXPLAIN ANALYZE` before deploying queries  
✅ Index columns used in WHERE/JOIN/ORDER BY  
✅ Use `LIMIT` for pagination  
✅ Denormalize for read-heavy queries  
❌ Avoid N+1 queries  
❌ Don't use SELECT *  
❌ Avoid complex JOINs (>4 tables)  

### Query Limits
- Max execution time: 30 seconds
- Alert if query > 1 second

---

## Data Integrity

### Soft Deletes
```sql
-- Add is_deleted flag instead of hard delete
ALTER TABLE projects ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_projects_deleted ON projects(is_deleted);
```

### Audit Trails
```sql
-- Track all changes
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY,
  table_name VARCHAR(255),
  operation VARCHAR(10),  -- INSERT, UPDATE, DELETE
  old_values JSON,
  new_values JSON,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP
);
```

---

## Backup & Recovery

- **Frequency:** Daily full backups + hourly incrementals
- **Retention:** 30-day rolling window
- **Testing:** Monthly restore drills
- **Documentation:** See [BACKUP.md](../13-DEVOPS/BACKUP.md)

---

## Related Documentation

- [API Standards](./API_STANDARDS.md)
- [BACKUP.md](../13-DEVOPS/BACKUP.md)
- [DISASTER_RECOVERY.md](../13-DEVOPS/DISASTER_RECOVERY.md)
