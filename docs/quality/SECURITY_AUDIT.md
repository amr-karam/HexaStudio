# Security Audit Report

**Last Updated:** 2026-07-08  
**Status:** Active Monitoring  

---

## Executive Summary

A security audit performed via `npm audit` identified 81 vulnerabilities (26 High, 46 Moderate, 9 Low) within the project's dependency tree. The majority of these vulnerabilities are nested dependencies within the Strapi 5 and NestJS frameworks.

## Critical Vulnerabilities

### 1. High Severity: `lodash` (Prototype Pollution)
- **Issue:** Vulnerable to code injection and prototype pollution via `_.template`.
- **Location:** Nested in `@strapi/design-system` and root `node_modules`.
- **Risk:** Potential for remote code execution or application crash.
- **Resolution:** Update to `lodash@^4.17.21`.

### 2. High Severity: `multer` (DoS)
- **Issue:** Vulnerable to Denial of Service via incomplete cleanup and resource exhaustion.
- **Location:** Nested in `@nestjs/platform-express`.
- **Risk:** Attackers can crash the server by sending malformed multipart requests.
- **Resolution:** Update to `multer@^1.4.5-lts.1`.

### 3. High Severity: `glob` (Command Injection)
- **Issue:** Command injection via `-c/--cmd` flag.
- **Location:** Nested in `@nestjs/cli` and `@angular-devkit`.
- **Risk:** Potential for arbitrary command execution during build/dev processes.
- **Resolution:** Update to `glob@^10.4.6`.

### 4. High Severity: `ws` (Memory Exhaustion)
- **Issue:** DoS via tiny fragments and data chunks.
- **Location:** Nested in `@strapi/data-transfer`.
- **Risk:** Server memory exhaustion.
- **Resolution:** Update to `ws@^8.20.2`.

---

## Root Cause Analysis: Dependency Conflict

The primary blocker for automated resolution (`npm audit fix`) is a **peer dependency conflict**:

- **Frontend/Root:** Uses **React 19**, the latest version for Next.js 15.
- **Strapi 5:** Requires **React 17 or 18**.

Because `npm audit fix` attempts to upgrade packages that might trigger a major version change or a peer dependency shift, it cannot safely resolve these without potentially breaking the Strapi admin interface or the Next.js frontend.

## Resolution Strategy

### Phase 1: Safe Updates (Immediate)
- Manually update top-level dependencies that have non-breaking patches.
- Use `npm install <package>@latest` for critical standalone utilities.

### Phase 2: Targeted Overrides (Short-term)
- Use the `overrides` field in `package.json` to force specific versions of nested dependencies (e.g., `lodash`, `glob`) without upgrading the parent package.

### Phase 3: Framework Alignment (Mid-term)
- Monitor Strapi 5 updates for official React 19 support.
- Evaluate moving Strapi to a separate repository/deployment to decouple its dependency tree from the frontend.

## Monitoring Plan

- **Daily:** `npm audit` check in CI pipeline.
- **Weekly:** Review Dependabot alerts.
- **Per-Release:** Security audit as part of the Quality Gate (Gate 5).
