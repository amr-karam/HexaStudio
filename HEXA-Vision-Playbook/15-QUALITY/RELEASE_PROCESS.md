# Release Process

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Release Cadence

| Type | Frequency | Version Bump | Branch |
|------|-----------|--------------|--------|
| Major | Quarterly | `x.0.0` | `release/x.0.0` |
| Minor | Monthly | `1.x.0` | `release/1.x.0` |
| Patch | As needed | `1.0.x` | `release/1.0.x` |
| Hotfix | Critical only | `1.0.x` | `hotfix/issue-id` |

---

## Release Lifecycle

```
develop ──► release/x.y.z ──► main ──► tag vx.y.z
              │                       │
              ▼                       ▼
         QA Testing             Production Deploy
              │
        Bug fixes ◄── (if needed)
              │
              ▼
         Final approval
```

---

## Release Preparation

### 1. Create Release Branch

```bash
git checkout develop
git pull origin develop
git checkout -b release/1.2.0
```

### 2. Version Bump

Update versions in:

- `package.json` (root + all apps)
- `HEXA-Vision-Playbook/README.md` (playbook version)
- Docker image tags

```bash
npm version 1.2.0 --workspaces
```

### 3. Update Changelog

```markdown
# Changelog

## [1.2.0] - 2026-07-15

### Added
- Interactive 3D project viewer with orbit controls
- Client portal with project timeline
- Dark mode support

### Changed
- Improved 3D model loading performance (-40% load time)
- Updated design system color tokens

### Fixed
- Navigation overflow on mobile devices
- Form validation error message display
```

### 4. Run Full Test Suite

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

---

## Release QA Checklist

### Functional

- [ ] All pages render without errors
- [ ] All links and navigation work
- [ ] All forms submit correctly
- [ ] 3D scenes load and render
- [ ] Authentication flow works (login, register, forgot password)
- [ ] Search functionality works
- [ ] Filtering and pagination work
- [ ] File upload/download works

### Visual

- [ ] No visual regressions (compare with baseline)
- [ ] Responsive design on 320px, 768px, 1024px, 1440px
- [ ] Dark mode works correctly
- [ ] Animations are smooth
- [ ] Fonts load correctly
- [ ] No layout shifts

### Performance

- [ ] Lighthouse scores meet targets (95+)
- [ ] Bundle size within budget
- [ ] 3D scenes maintain 60 FPS
- [ ] API response times within limits
- [ ] No memory leaks

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility (VoiceOver test)
- [ ] Color contrast ratios meet WCAG AA
- [ ] Reduced motion respected
- [ ] Focus indicators visible

### Security

- [ ] No secrets exposed in code
- [ ] JWT tokens expire correctly
- [ ] Rate limiting active
- [ ] CSP headers present
- [ ] SQL injection prevention (validated inputs)

### Integration

- [ ] API endpoints return expected data
- [ ] Strapi ↔ NestJS sync works
- [ ] Odoo ↔ NestJS sync works
- [ ] Webhook-triggered ISR works
- [ ] Email sending works

---

## Release Approval

### Gate Review

The Quality Gate Controller must approve the release. See `QUALITY_GATES.md`.

### Sign-offs Required

| Role | Sign-off |
|------|----------|
| Product Owner | Feature completeness |
| QA Lead | Test results |
| Security Engineer | Security audit |
| DevOps Engineer | Deployment readiness |
| Chief Architect | Architecture compliance |

### Approval Criteria

- [ ] All QA checks pass
- [ ] No critical or high bugs open
- [ ] Performance budgets met
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] All sign-offs obtained

---

## Deployment

### Production Deploy

```bash
# 1. Merge release branch to main
git checkout main
git merge release/1.2.0

# 2. Tag the release
git tag v1.2.0
git push origin main --tags

# 3. Deploy (GitHub Action triggers automatically)
# Or manually:
ssh deploy@hexastudio.net
cd /opt/hexastudio
git pull origin main
docker compose pull
docker compose up -d
```

### Post-Deploy Verification

```bash
# 1. Check health endpoint
curl https://hexastudio.net/api/health

# 2. Verify frontend loads
curl -I https://hexastudio.net

# 3. Verify API responds
curl https://hexastudio.net/api/v1/projects

# 4. Run smoke tests
npm run test:smoke

# 5. Check Sentry for errors
# Open Sentry dashboard
```

### Rollback Plan

If deployment fails:

```bash
# Option 1: Rollback to previous tag
git checkout v1.1.0
docker compose up -d

# Option 2: Rollback specific service
docker compose up -d frontend:v1.1.0

# Option 3: Full rollback with previous compose
docker compose -f docker-compose.rollback.yml up -d
```

---

## Post-Release

### 1. Merge Back to Develop

```bash
git checkout develop
git merge main
git push origin develop
```

### 2. Monitor

- Watch Sentry for 48 hours for new errors
- Monitor performance metrics
- Watch for support tickets

### 3. Retrospective

Within 1 week of release, conduct:

- What went well?
- What went wrong?
- What should we improve?
- Update IMPROVEMENT_ROADMAP.md

---

## Hotfix Process

### When to Use

- Production is broken (users cannot complete critical flow)
- Security vulnerability
- Data loss scenario

### Steps

1. **Branch**: `git checkout -b hotfix/issue-id main`
2. **Fix**: Implement minimal fix
3. **PR**: Open PR against `main` (skip `develop`)
4. **Review**: Expedited review (1 approver minimum)
5. **Deploy**: Merge → tag → deploy immediately
6. **Backport**: Cherry-pick fix to `develop`
7. **Monitor**: Watch for 24 hours

### Critical: Hotfix Versioning

Hotfix releases increment the patch version:

```
v1.2.0 → hotfix fixes issue → v1.2.1
```
