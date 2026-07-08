# Development Workflow

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT LIFECYCLE                        │
│                                                                     │
│  Planning → Design → Implementation → Review → Testing → Deploy     │
│     │          │           │            │        │         │        │
│     └──────────┴───────────┴────────────┴────────┴─────────┘        │
│                          Feedback Loop                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Sprint Planning

### Frequency
- 2-week sprints
- Sprint planning on Day 1
- Sprint review on Day 14
- Retrospective on Day 14

### Inputs
- `PROJECT_ROADMAP.md` for phase priorities
- Active sprint in `sprints/` directory
- Backlog items from `sprints/backlog.md`
- Technical debt items from `TECH_DEBT.md`

### Process
1. Review roadmap priorities
2. Move items from backlog to sprint
3. Estimate effort (T-shirt sizes: S, M, L, XL)
4. Assign owners
5. Define acceptance criteria
6. Update `sprints/current.md`

### Exit Criteria
- [ ] All sprint items have acceptance criteria
- [ ] Sprint capacity is respected (no overcommitment)
- [ ] Technical debt items are included (minimum 20% of sprint)
- [ ] Owner assigned for each item

---

## 2. Feature Development

### Step-by-step

1. **Create feature branch** from `develop`
   - Branch naming: `feature/descriptive-kebab-case-name`

2. **Set up local environment**
   - `npm install`
   - Copy `.env.example` to `.env`
   - `docker compose -f docker-compose.dev.yml up -d`
   - `npm run dev`

3. **Implement the feature**
   - Follow `CODING_STANDARDS.md`
   - Write types first in `packages/types/`
   - Write unit tests alongside implementation
   - Run `npm run lint` and `npm run typecheck` frequently

4. **Self-review**
   - Run all lint checks
   - Run all type checks
   - Run all tests
   - Verify against acceptance criteria

5. **Create Pull Request**
   - Title follows Conventional Commits
   - Description includes: What, Why, How to Test
   - Screenshots for UI changes
   - Checklist completed

6. **Code Review**
   - Minimum one approval required
   - Address all comments
   - Re-run checks after changes

7. **Merge**
   - Squash merge into `develop`
   - Delete feature branch

---

## 3. Development Environment

### Local Setup

```bash
# Clone repository
git clone https://github.com/hexastudio/hexa-studio.git
cd hexa-studio

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Start development servers
npm run dev
```

### Available Services (Local)

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:4000 | 4000 |
| API Docs | http://localhost:4000/api/docs | 4000 |
| Strapi Admin | http://localhost:1337/admin | 1337 |
| Odoo | http://localhost:8069 | 8069 |
| MinIO Console | http://localhost:9001 | 9001 |
| Redis Insight | http://localhost:5540 | 5540 |

### Docker Services (Local)

```yaml
services:
  postgres:    # PostgreSQL 16
  redis:       # Redis 7
  minio:       # S3-compatible storage
  mailhog:     # Email testing
  adminer:     # Database browser
```

### Environment Variables

All environment variables are documented in `.env.example`. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `MINIO_ENDPOINT` | MinIO endpoint | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRAPI_API_TOKEN` | Strapi API token | Yes |
| `ODOO_HOST` | Odoo host | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | Yes |
| `SENTRY_DSN` | Backend Sentry DSN | Yes |

---

## 4. Verification

### Before Committing

```bash
npm run lint          # ESLint check
npm run typecheck     # TypeScript check
npm run test          # Unit tests
npm run build         # Build check
```

### Before Opening PR

```bash
npm run lint          # Must pass 0 errors
npm run typecheck     # Must pass 0 errors
npm run test          # All tests green
npm run build         # Build successful
```

### Before Merging

- [ ] CI pipeline passes (lint, typecheck, test, build)
- [ ] Minimum one code review approval
- [ ] No unresolved conversations
- [ ] UI changes have screenshots
- [ ] Acceptance criteria met

---

## 5. Hotfix Workflow

For critical production issues:

1. Create branch from `main`: `hotfix/issue-id`
2. Fix and verify
3. PR into `main` (skip `develop`)
4. After merge, cherry-pick into `develop`
5. Deploy immediately

### Criteria for Hotfix
- Production is broken (users cannot complete critical flow)
- Security vulnerability
- Data loss scenario

---

## 6. Definition of Done

See `QUALITY_GATES.md` for the complete Definition of Done.

### Quick Reference

- [ ] Code follows all standards (linted, formatted)
- [ ] TypeScript strict mode — no `any` types
- [ ] Unit tests written and passing
- [ ] Acceptance criteria verified
- [ ] No console errors
- [ ] Performance budget maintained
- [ ] Accessibility verified
- [ ] Responsive design verified
- [ ] Documentation updated
- [ ] PR reviewed and approved
