# API Endpoints Reference

**Base URL:** `/v1`

---

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/refresh` | Refresh access token | Refresh |
| POST | `/auth/logout` | Logout | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No (with token) |
| GET | `/auth/me` | Get current user profile | Yes |

## Projects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/projects` | List all projects | No |
| GET | `/projects/:slug` | Get project by slug | No |
| GET | `/projects/:slug/scene` | Get 3D scene data | No |
| GET | `/projects/featured` | Get featured projects | No |

> **Odoo live-status enrichment:** `GET /projects/:slug` attaches a `liveStatus { stage, progress, lastUpdate }` object sourced from the Odoo `project.project` record matched by `x_slug`. The lookup has a 2s timeout guard and a 5-minute Redis cache (`projects:live-status:<slug>`); on Odoo unavailability the response degrades gracefully (project returned without `liveStatus`).

## Pages (Strapi Bridge)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/pages` | List CMS pages (paginated, `?locale=` param) | No |
| GET | `/pages/:slug` | Get CMS page by slug (`?locale=` param) | No |

## Achievements (Strapi Bridge)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/achievements` | List achievements (sorted by `order`) | No |

## Contacts / CRM

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/contacts` | Submit contact form | No |
| GET | `/contacts` | List contacts | Admin |
| GET | `/contacts/:id` | Get contact detail | Admin |
| PUT | `/contacts/:id` | Update contact | Admin |
| POST | `/contacts/:id/convert` | Convert to lead in Odoo | Admin |

## Content (Strapi Bridge)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/content/pages/:slug` | Get page content | No |
| GET | `/content/blog` | List blog posts | No |
| GET | `/content/blog/:slug` | Get blog post | No |
| GET | `/content/services` | List services | No |
| GET | `/content/services/:slug` | Get service | No |

## Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List users | Admin |
| GET | `/users/:id` | Get user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| PUT | `/users/:id/roles` | Update user roles | Superadmin |

## Client Portal

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/portal/projects` | List client's projects | Client |
| GET | `/portal/projects/:id` | Get project detail | Client |
| GET | `/portal/projects/:id/files` | List project files | Client |
| POST | `/portal/projects/:id/files` | Upload file | Client |
| GET | `/portal/notifications` | List notifications | Client |
| PUT | `/portal/notifications/:id/read` | Mark as read | Client |

## Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/dashboard/stats` | Dashboard statistics | Admin |
| GET | `/admin/analytics/overview` | Analytics overview | Admin |
| GET | `/admin/audit-logs` | Audit log entries | Superadmin |

## System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| GET | `/health/ready` | Readiness check | No |
| GET | `/health/live` | Liveness check | No |
