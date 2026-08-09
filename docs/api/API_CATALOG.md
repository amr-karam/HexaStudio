# HEXA Studio — API Catalog

> **Version:** 1.0 | **Last Updated:** 2026-07-26 | **Base URL:** `https://api.hexastudio.net/api/v1`

## Table of Contents

- [Public Endpoints](#public-endpoints-no-auth-required)
- [Authenticated Endpoints](#authenticated-endpoints-jwt-required)
- [Admin-Only Endpoints](#admin-only-endpoints)
- [Webhook Endpoints](#webhook-endpoints)
- [Odoo API Endpoints](#odoo-api-endpoints-admin-only)

---

## Common Response Envelope

All endpoints return responses in the following format:

```json
{
  "status": "success",
  "data": {},
  "errors": [],
  "meta": {
    "timestamp": "2026-07-26T10:00:00Z",
    "request_id": "uuid",
    "api_version": "v1"
  }
}
```

## Common Error Codes

| Code | Message |
|------|---------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource does not exist |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## Public Endpoints (No Auth Required)

---

### GET /api/achievements

List all achievements sorted by display order.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all achievements ordered by their sort position |
| **Auth** | None |
| **Rate Limit** | 100 req/min (standard) |
| **Cache** | 5 minutes (CDN) |
| **Response** | `AchievementResponse: { data: Achievement[] }` |
| **Errors** | 500: Internal server error |

**Example Response:**
```json
{
  "data": [
    { "id": "1", "title": "Founded 2020", "value": "5+", "order": 1 },
    { "id": "2", "title": "Projects Delivered", "value": "150+", "order": 2 }
  ]
}
```

---

### GET /api/articles

Get all articles with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of published articles/blog posts |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (ISR) |
| **Response** | `ArticleResponse: { data: Article[], meta: { page, limit, total, totalPages } }` |
| **Errors** | 500: Internal server error |

---

### GET /api/articles/:slug

Get a single article by its URL slug.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | URL slug of the article |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns full article content by slug |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `Article` |
| **Errors** | 404: Article not found |

---

### GET /api/services

Get all services with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of all services offered |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 5 minutes (CDN) |
| **Response** | `ServiceResponse: { data: Service[], meta: { page, limit, total, totalPages } }` |
| **Errors** | 500: Internal server error |

---

### GET /api/services/:slug

Get a single service by URL slug.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns full service details by slug |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 5 minutes (CDN) |
| **Response** | `Service` |
| **Errors** | 404: Service not found |

---

### GET /api/projects

Get all portfolio projects with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of portfolio projects |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 5 minutes (CDN) |
| **Response** | `ProjectResponse: { data: Project[], meta: { page, limit, total, totalPages } }` |
| **Errors** | 500: Internal server error |

---

### GET /api/projects/:slug

Get a single project by URL slug.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns full project details by slug |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 5 minutes (CDN) |
| **Response** | `Project` |
| **Errors** | 404: Project not found |

---

### GET /api/projects/:slug/similar

Get AI-powered similar project recommendations.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Slug of the reference project |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 5 | Number of similar projects to return |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns semantically similar projects using vector embeddings |
| **Auth** | None |
| **Rate Limit** | 30 req/min (heavier computation) |
| **Cache** | 1 hour (DB-level) |
| **Response** | `SimilarProjectResult[]` |
| **Errors** | 404: Project not found |

---

### GET /api/pages

Get all CMS pages with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of CMS-managed pages |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN + ISR) |
| **Response** | `PageResponse: { data: Page[], meta }` |
| **Errors** | 500: Internal server error |

---

### GET /api/pages/:slug

Get a single page by URL slug.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns full page content by slug |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `Page` |
| **Errors** | 404: Page not found |

---

### GET /api/team-members

Get all team members with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page (default 50) |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of company team members |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `TeamMemberResponse: { data: TeamMember[], meta }` |
| **Errors** | 500: Internal server error |

---

### GET /api/team-members/:slug

Get a single team member by slug.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns team member details by slug |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `TeamMember` |
| **Errors** | 404: Team member not found |

---

### GET /api/testimonials

Get all testimonials with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of client testimonials |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `TestimonialResponse: { data: Testimonial[], meta }` |
| **Errors** | 500: Internal server error |

---

### GET /api/testimonials/featured

Get featured/testimonial highlights for the home page.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns only featured/promoted testimonials |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `Testimonial[]` |
| **Errors** | 500: Internal server error |

---

### GET /api/testimonials/:id

Get a single testimonial by ID.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns testimonial by its database ID |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `Testimonial` |
| **Errors** | 404: Testimonial not found |

---

### GET /api/faqs

Get all FAQs with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Items per page (default 50) |
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Paginated list of frequently asked questions |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `FAQResponse: { data: FAQ[], meta }` |
| **Errors** | 500: Internal server error |

---

### GET /api/faqs/category/:category

Get FAQs filtered by category.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Category slug (e.g. "general", "pricing", "process") |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locale` | string | `en` | Locale code for i18n |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns FAQs for a specific category |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `FAQ[]` |
| **Errors** | 404: Category not found |

---

### GET /api/faqs/:id

Get a single FAQ by ID.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns FAQ by database ID |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (CDN) |
| **Response** | `FAQ` |
| **Errors** | 404: FAQ not found |

---

### GET /api/currency/list

List all supported currencies with details.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all supported currencies with symbol, code, and exchange rate info |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (Redis) |
| **Response** | `CurrencyConfig[]` |
| **Errors** | 500: Internal server error |

---

### GET /api/currency/:code

Get details for a specific currency.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `code` | string | ISO 4217 currency code (e.g. "USD", "EUR") |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns currency configuration for the given code |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (Redis) |
| **Response** | `CurrencyConfig` |
| **Errors** | 404: Currency not found |

---

### GET /api/currency/rates

Get exchange rate between two currencies.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `from` | string | `USD` | Source currency code |
| `to` | string | `EUR` | Target currency code |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns current exchange rate from source to target currency |
| **Auth** | None |
| **Rate Limit** | 100 req/min |
| **Cache** | 1 hour (Redis) |
| **Response** | `{ from: string, to: string, rate: number, timestamp: Date }` |
| **Errors** | 404: Exchange rate not found |

---

### POST /api/pricing/calculate

Calculate regional pricing with tax compliance.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `baseAmount` | number | Yes | Base price amount |
| `baseCurrency` | string | Yes | ISO currency code (e.g. "USD") |
| `targetCurrency` | string | Yes | Target currency code |
| `region` | string | No | ISO region code (auto-detected from IP if omitted) |
| `includesTax` | boolean | No | Whether the base amount includes tax |

| Attribute | Value |
|-----------|-------|
| **Description** | Calculates full pricing breakdown with tax, regional markup, and final amount |
| **Auth** | None |
| **Rate Limit** | 30 req/min |
| **Cache** | No (dynamic pricing) |
| **Response** | `PricingResponse: { baseAmount, baseCurrency, targetCurrency, exchangeRate, taxAmount, regionalMarkup, finalAmount }` |
| **Errors** | 400: Invalid input, 422: Region detection failed |

---

### GET /api/pricing/preview

Quick preview of pricing in a region.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `baseAmount` | number | 99.99 | Base price |
| `baseCurrency` | string | `USD` | ISO currency code |
| `region` | string | — | ISO region code (auto-detected from IP if omitted) |

| Attribute | Value |
|-----------|-------|
| **Description** | Quick pricing preview without full body payload |
| **Auth** | None |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `PricingResponse` |
| **Errors** | 400: Invalid parameters |

---

### GET /api/geoip

GeoIP self-lookup for the caller's IP address.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns GeoIP data (country, region, city, timezone) for the requestor's IP |
| **Auth** | None |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `GeoIpResult: { ip, country, region, city, timezone, lat, lon }` |
| **Errors** | 500: GeoIP database not available |

---

### POST /api/vector/search/public

Perform public semantic search across projects.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `limit` | integer | No | Max results (default: 5) |

| Attribute | Value |
|-----------|-------|
| **Description** | Public vector-based semantic search for projects |
| **Auth** | None |
| **Rate Limit** | 20 req/min |
| **Cache** | No (real-time embedding) |
| **Response** | `SemanticSearchResponse: { results: { id, slug, score, title }[] }` |
| **Errors** | 400: Missing query |

---

### GET /api/vector/recommendations/:slug

Get similar project recommendations (public).

| Attribute | Value |
|-----------|-------|
| **Description** | Returns semantically similar projects using vector embeddings (public alias) |
| **Auth** | None |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 hour (DB-level) |
| **Response** | `SimilarProjectResult[]` |
| **Errors** | 404: Project not found |

---

### GET /api/health

Health check endpoint.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns API health status and dependency checks |
| **Auth** | None |
| **Rate Limit** | None |
| **Cache** | No |
| **Response** | `{ status: "ok", timestamp, service: "hexastudio-api", dependencies: { odoo: "ok"|"error" } }` |
| **Errors** | 503: One or more dependencies unhealthy |

---

### GET /api/mobile/health

Mobile API health check.

| Attribute | Value |
|-----------|-------|
| **Description** | Quick health check for the mobile API |
| **Auth** | None |
| **Rate Limit** | None |
| **Cache** | No |
| **Response** | `"Mobile API active"` |
| **Errors** | None |

---

### POST /api/contact

Submit a contact message.

**Rate Limit:** 5 requests per 60 seconds per IP.

**Request Body:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | `@IsString()` | Full name of sender |
| `email` | string | Yes | `@IsEmail()` | Email address |
| `company` | string | No | `@IsString()` | Company name |
| `phone` | string | No | `@IsString()` | Phone number |
| `service` | string | No | `@IsString()` | Service slug (e.g. "residential") |
| `budget` | string | No | `@IsIn(['under_50k','50k_100k','100k_500k','500k_plus'])` | Budget range |
| `message` | string | Yes | `@IsString()` | Message content |

| Attribute | Value |
|-----------|-------|
| **Description** | Submits a contact/enquiry form message |
| **Auth** | None |
| **Rate Limit** | 5 req/min |
| **Cache** | No |
| **Response** | `{ success: true }` |
| **Errors** | 400: Validation failed, 429: Rate limit exceeded |

---

### POST /api/mobile/register

Register a new user (mobile-friendly).

**Rate Limit:** 5 requests per 60 seconds per IP.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | `@IsEmail()` |
| `username` | string | Yes | `@IsString()`, `@MinLength(3)`, `@MaxLength(30)` |
| `password` | string | Yes | `@IsString()`, `@MinLength(12)`, `@MaxLength(100)`, must contain uppercase, lowercase, number, special character |

| Attribute | Value |
|-----------|-------|
| **Description** | Register a new user account (mobile API variant) |
| **Auth** | None |
| **Rate Limit** | 5 req/min |
| **Cache** | No |
| **Response** | `{ user, accessToken, refreshToken }` |
| **Errors** | 400: Validation failed, 409: Email/username already exists |

---

### POST /api/mobile/login

Login with credentials (mobile-friendly).

**Rate Limit:** 10 requests per 60 seconds per IP.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `identifier` | string | Yes | `@IsString()`, `@MaxLength(100)` |
| `password` | string | Yes | `@IsString()`, `@MaxLength(100)` |

| Attribute | Value |
|-----------|-------|
| **Description** | Login with email/username (mobile API variant) |
| **Auth** | None |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ user, accessToken, refreshToken }` |
| **Errors** | 401: Invalid credentials |

---

## Authenticated Endpoints (JWT Required)

---

### POST /api/auth/register

Register a new user.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | `@IsEmail()` |
| `username` | string | Yes | `@IsString()`, `@MinLength(3)`, `@MaxLength(30)` |
| `password` | string | Yes | `@IsString()`, `@MinLength(12)`, `@MaxLength(100)`, must contain uppercase, lowercase, number, special character |

| Attribute | Value |
|-----------|-------|
| **Description** | Creates a new user account. Sets `auth_token` and CSRF cookies |
| **Auth** | None (self-registration) |
| **Rate Limit** | 5 req/min |
| **Cache** | No |
| **Response** | `{ user, accessToken, refreshToken }` |
| **Errors** | 400: Validation failed, 409: Email already exists |

---

### POST /api/auth/login

Login with credentials.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `identifier` | string | Yes | Email or username |
| `password` | string | Yes | User password |

| Attribute | Value |
|-----------|-------|
| **Description** | Authenticates user, sets `auth_token` and CSRF cookies |
| **Auth** | None |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ user, accessToken, refreshToken }` |
| **Errors** | 401: Invalid credentials |

---

### GET /api/auth/me

Get current authenticated user profile.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns the profile of the currently authenticated user |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `User` |
| **Errors** | 401: Unauthorized |

---

### POST /api/auth/refresh

Refresh JWT token (cookie-based, legacy).

| Attribute | Value |
|-----------|-------|
| **Description** | Refreshes the access token using the current cookie-based token |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ user }` |
| **Errors** | 401: Invalid token |

---

### POST /api/auth/refresh-token

Refresh JWT using refresh token (mobile-friendly).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | Yes | Valid refresh token |

| Attribute | Value |
|-----------|-------|
| **Description** | Issues new access/refresh token pair using a refresh token |
| **Auth** | None (uses refresh token) |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ user, accessToken, refreshToken }` |
| **Errors** | 401: Invalid refresh token |

---

### POST /api/auth/logout

Logout and invalidate tokens.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | No | Refresh token to invalidate |

| Attribute | Value |
|-----------|-------|
| **Description** | Invalidates access and refresh tokens, clears auth cookies |
| **Auth** | CSRF token required |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ success: true }` |
| **Errors** | 403: CSRF token mismatch |

---

### POST /api/auth/forgot-password

Request a password reset email.

**Rate Limit:** 3 requests per 300 seconds.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | `@IsEmail()` |

| Attribute | Value |
|-----------|-------|
| **Description** | Sends a password reset code to the user's email |
| **Auth** | None |
| **Rate Limit** | 3 req/300s |
| **Cache** | No |
| **Response** | `{ success: true }` |
| **Errors** | 400: Failed to send email, 429: Rate limit exceeded |

---

### POST /api/auth/reset-password

Reset password with verification code.

**Rate Limit:** 3 requests per 300 seconds.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `code` | string | Yes | Reset verification code |
| `password` | string | Yes | `@MinLength(12)`, `@MaxLength(100)`, must contain uppercase, lowercase, number, special character |
| `passwordConfirmation` | string | Yes | Must match `password` |

| Attribute | Value |
|-----------|-------|
| **Description** | Resets the user password using the code received via email |
| **Auth** | None (uses code) |
| **Rate Limit** | 3 req/300s |
| **Cache** | No |
| **Response** | `{ success: true }` |
| **Errors** | 400: Invalid code or password mismatch, 429: Rate limit exceeded |

---

### POST /api/auth/change-password

Change password (authenticated user).

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `currentPassword` | string | Yes | `@MinLength(12)`, `@MaxLength(100)` |
| `newPassword` | string | Yes | `@MinLength(12)`, `@MaxLength(100)`, must contain uppercase, lowercase, number, special character |

| Attribute | Value |
|-----------|-------|
| **Description** | Changes the authenticated user's password. Issues new tokens |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 3 req/min |
| **Cache** | No |
| **Response** | `{ user, accessToken, refreshToken }` |
| **Errors** | 400: Wrong current password, 401: Unauthorized |

---

### GET /api/users/me

Get current user profile.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns the currently authenticated user's full profile |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `User` |
| **Errors** | 401: Unauthorized, 404: User not found |

---

### GET /api/users/:id

Get user by ID.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | User UUID |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns user details by their database ID |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `User` |
| **Errors** | 401: Unauthorized, 404: User not found |

---

### POST /api/requests

Create a new project request.

**Request Body:** `Partial<ProjectRequest>`

| Attribute | Value |
|-----------|-------|
| **Description** | Creates a new project request/quote |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `ProjectRequest` |
| **Errors** | 400: Validation failed, 401: Unauthorized |

---

### GET /api/requests/client/:clientId

Get requests by client ID.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `clientId` | string | Client UUID |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all project requests for a specific client |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user (own client ID or higher) |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `{ data: ProjectRequest[], meta: { total, page, limit, totalPages } }` |
| **Errors** | 401: Unauthorized |

---

### PATCH /api/requests/:id/status

Update request status.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Request UUID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status value (draft, submitted, in_review, approved, rejected) |

| Attribute | Value |
|-----------|-------|
| **Description** | Updates the status of a project request |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `ProjectRequest` |
| **Errors** | 400: Invalid status, 401: Unauthorized, 404: Not found |

---

### GET /api/storage/download-url

Get a presigned download URL from MinIO.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `bucket` | string | Yes | One of: `uploads`, `models`, `textures`, `videos`, `hdr`, `backups` |
| `path` | string | Yes | Object path within the bucket |
| `expiry` | integer | No | URL expiry in seconds (60-86400, default: 3600) |

| Attribute | Value |
|-----------|-------|
| **Description** | Generates a time-limited presigned URL for downloading a file |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 60 req/min |
| **Cache** | No |
| **Response** | `{ url: string }` |
| **Errors** | 400: Invalid expiry, bucket, or path |

---

### GET /api/storage/upload-url

Get a presigned upload URL to MinIO.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `bucket` | string | Yes | One of: `uploads`, `models`, `textures`, `videos`, `hdr`, `backups` |
| `path` | string | Yes | Desired object path |
| `expiry` | integer | No | URL expiry in seconds (60-86400, default: 3600) |

| Attribute | Value |
|-----------|-------|
| **Description** | Generates a time-limited presigned URL for uploading a file |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `{ url: string }` |
| **Errors** | 400: Invalid expiry, bucket, or path |

---

### POST /api/requests/admin

Get all requests (admin view).

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all project requests across all clients |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin role |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `{ data: ProjectRequest[], meta: { total, page, limit, totalPages } }` |
| **Errors** | 401: Unauthorized, 403: Forbidden |

---

### POST /api/agents/chat

Chat with AI agent.

**Request Body:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `message` | string | Yes | `@IsString()`, `@IsNotEmpty()` | User message |
| `provider` | string | No | `@IsIn(['openai', 'gemini'])` | AI provider (default: openai) |
| `previousInteractionId` | string | No | `@IsString()` | For conversation threading |

| Attribute | Value |
|-----------|-------|
| **Description** | Sends a message to the AI agent and returns a response |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 20 req/min |
| **Cache** | No |
| **Response** | `{ response: string, interactionId?: string }` |
| **Errors** | 401: Unauthorized, 503: AI provider unavailable |

---

### POST /api/agents/deep-research

Deep research via Gemini AI.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Research query |

| Attribute | Value |
|-----------|-------|
| **Description** | Performs deep research using Gemini AI |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user, requires `GEMINI_API_KEY` |
| **Rate Limit** | 5 req/min |
| **Cache** | No |
| **Response** | `{ response: string }` |
| **Errors** | 401: Unauthorized, 503: Gemini not configured |

---

### POST /api/vector/search

Perform authenticated semantic search.

**Request Body:** `SemanticSearchRequest`

| Attribute | Value |
|-----------|-------|
| **Description** | Performs vector-based semantic search across indexed projects |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No (real-time embedding) |
| **Response** | `SemanticSearchResponse` |
| **Errors** | 401: Unauthorized |

---

### POST /api/vector/sync/all

Trigger full re-index of all projects to vector store.

| Attribute | Value |
|-----------|-------|
| **Description** | Starts a background job to re-embed all projects into the vector database |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 1 req/5min |
| **Cache** | No |
| **Response** | `{ message: "Full re-index started" }` |
| **Errors** | 401: Unauthorized |

---

### POST /api/vector/sync/:slug

Sync a specific project to vector store.

| Attribute | Value |
|-----------|-------|
| **Description** | Triggers embedding and indexing of a single project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ message: "Syncing project {slug} started" }` |
| **Errors** | 401: Unauthorized, 404: Project not found |

---

### POST /api/vector/tags/:slug

Generate AI tags for a project.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Project URL slug |

| Attribute | Value |
|-----------|-------|
| **Description** | Uses AI (auto-tag service) to generate relevant tags for a project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ tags: string[] }` |
| **Errors** | 401: Unauthorized, 404: Project not found |

---

### POST /api/vector/lighting/:slug

Get AI lighting recommendations for a project.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Project URL slug |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 3 | Number of recommendations |

| Attribute | Value |
|-----------|-------|
| **Description** | AI-powered lighting design recommendations based on project content |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ id: string, score: number }[]` |
| **Errors** | 401: Unauthorized, 404: Project not found |

---

### POST /api/approvals/submit

Submit a phase for approval.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | Yes | Project UUID |
| `phaseName` | string | Yes | Name of the phase to submit |

| Attribute | Value |
|-----------|-------|
| **Description** | Submits a project phase for client/manager approval |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | Approval record |
| **Errors** | 401: Unauthorized, 400: Phase already submitted |

---

### PATCH /api/approvals/:id/review

Review a submitted phase.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Approval record ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | One of: `approved`, `rejected`, `revision` |
| `comment` | string | No | Reviewer comment |

| Attribute | Value |
|-----------|-------|
| **Description** | Review and approve/reject/request-revision on a submitted phase |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user (reviewer) |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | Updated approval record |
| **Errors** | 401: Unauthorized, 404: Not found |

---

### GET /api/approvals/project/:projectId

Get all phase approvals for a project.

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `projectId` | string | Project UUID |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all approval records for a project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | Approval[] |
| **Errors** | 401: Unauthorized |

---

### POST /api/annotations

Add an annotation to a project.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | Yes | Project UUID |
| `type` | string | Yes | One of: `text`, `drawing`, `pin` |
| `position` | object | Yes | `{ x: number, y: number, z?: number }` |
| `content` | string | Yes | Annotation content |
| `author` | string | Yes | Author identifier |
| `resolved` | boolean | No | Whether resolved (default: false) |

| Attribute | Value |
|-----------|-------|
| **Description** | Adds a text, drawing, or pin annotation to a project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | Annotation record |
| **Errors** | 400: Validation failed, 401: Unauthorized |

---

### PATCH /api/annotations/:id/resolve

Resolve an annotation.

| Attribute | Value |
|-----------|-------|
| **Description** | Marks an annotation as resolved |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | Updated annotation |
| **Errors** | 404: Annotation not found, 401: Unauthorized |

---

### GET /api/annotations/project/:projectId

Get all annotations for a project.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all annotations associated with a project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | Annotation[] |
| **Errors** | 401: Unauthorized |

---

## Client Portal Endpoints (JWT Required)

---

### GET /api/portal/me

Get the authenticated client's portal data.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns the basic client project data for the portal |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | Client project data |
| **Errors** | 401: Unauthorized |

---

### GET /api/portal/dashboard

Get aggregated dashboard data.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns project health, KPIs, recent activity, upcoming milestones, pending approvals, and notification summary |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | `PortalDashboardData` |
| **Errors** | 401: Unauthorized |

---

### GET /api/portal/odoo/projects

Get client-visible Odoo projects.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns Odoo projects visible to the authenticated client, resolved via partner email |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | `Project[]` (empty array if no partner match) |
| **Errors** | 401: Unauthorized |

---

### GET /api/portal/odoo/projects/:id/milestones

Get client-viewable milestones for a project.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns milestones for a project, verifying client ownership |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | `Milestone[]` |
| **Errors** | 401: Unauthorized |

---

### GET /api/portal/odoo/invoices

Get client invoices.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns invoices associated with the authenticated client |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | `Invoice[]` (empty array if no invoices) |
| **Errors** | 401: Unauthorized |

---

### GET /api/portal/projects/:projectId/detail

Get detailed project information for the workspace.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns project metadata, team members, milestones, and progress |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user (project client) |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | `PortalProjectDetail \| null` |
| **Errors** | 401: Unauthorized, 404: Not found |

---

### GET /api/portal/projects/:projectId/tasks

Get Kanban tasks for a project.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns client-visible tasks mapped to Kanban status columns (Todo, In Progress, Review, Done) |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 30 seconds |
| **Response** | `PortalTask[]` |
| **Errors** | 401: Unauthorized |

---

### GET /api/portal/projects/:projectId/team

Get team members assigned to a project.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns HEXA Studio team members working on the project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 5 minutes |
| **Response** | `PortalTeamMember[]` |
| **Errors** | 401: Unauthorized |

---

### POST /api/portal/projects/:projectId/documents

Upload a document to a portal project.

**Request:** Multipart form-data with `file` (binary) and optional `description` (string).

**File Constraints:**

| Constraint | Value |
|-----------|-------|
| **Max Size** | 50 MB |
| **Allowed Types** | PDF, PNG, JPEG, GIF, WebP, SVG, DOC, DOCX, XLS, XLSX, ZIP |

| Attribute | Value |
|-----------|-------|
| **Description** | Uploads a file and associates it with a project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | Document record |
| **Errors** | 400: File too large or invalid type, 401: Unauthorized |

---

### GET /api/portal/projects/:projectId/documents

List all documents for a portal project.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all documents uploaded to a project |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | Document[] |
| **Errors** | 401: Unauthorized |

---

### DELETE /api/portal/projects/:projectId/documents/:documentId

Delete a document from a portal project.

| Attribute | Value |
|-----------|-------|
| **Description** | Deletes a document file and its metadata |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user (owner) |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ message: "Document deleted successfully" }` |
| **Errors** | 401: Unauthorized, 404: Not found |

---

### GET /api/portal/notifications/preferences

Get notification preferences.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns the authenticated user's notification preferences |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | Notification preferences object |
| **Errors** | 401: Unauthorized |

---

### PUT /api/portal/notifications/preferences

Update notification preferences.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `preferences` | object | Yes | `Record<string, boolean>` map of notification toggles |
| `userId` | string | No | Target user ID (admin override, defaults to self) |

| Attribute | Value |
|-----------|-------|
| **Description** | Updates the notification preferences for the authenticated user |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ message: "Notification preferences saved" }` |
| **Errors** | 401: Unauthorized |

---

### POST /api/portal/copilot/query

Query the HEXA Portal AI Copilot.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Natural language question |
| `projectName` | string | No | Project name for scoped context |

| Attribute | Value |
|-----------|-------|
| **Description** | Sends a query to the Portal AI Copilot for project context and assistance |
| **Auth** | JWT (Bearer) |
| **Permissions** | Authenticated portal user |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | Copilot response |
| **Errors** | 401: Unauthorized, 503: AI unavailable |

---

### POST /api/projects

Create a new project (Strapi + Odoo).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Project title |
| `slug` | string | Yes | URL slug (must be unique) |
| `description` | string | No | Project description |
| `client` | string | No | Client name |
| `services` | string[] | No | Array of service slugs |

| Attribute | Value |
|-----------|-------|
| **Description** | Creates a new project in Strapi CMS and syncs to Odoo. If slug exists, re-syncs |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin role |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ slug: string, strapiId: number, odooId: number \| null }` |
| **Errors** | 401: Unauthorized, 403: Forbidden, 400: Validation failed |

---

### PATCH /api/projects/:slug/status

Update project live status (write-back to Odoo).

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Project URL slug |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | One of: `draft`, `in_progress`, `review`, `completed`, `on_hold`, `cancelled` |

| Attribute | Value |
|-----------|-------|
| **Description** | Updates the project's stage in Odoo and syncs back to Strapi |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin role |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ slug: string, status: string }` |
| **Errors** | 400: Unknown status, 401: Unauthorized, 403: Forbidden |

---

### POST /api/currency/sync-rates

Manually trigger exchange rate sync from open.er-api.com.

| Attribute | Value |
|-----------|-------|
| **Description** | Triggers a manual sync of exchange rates from the external provider |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin role |
| **Rate Limit** | 1 req/10min |
| **Cache** | No |
| **Response** | `{ success: true, message: "Exchange rate sync triggered successfully" }` |
| **Errors** | 401: Unauthorized, 403: Forbidden |

---

### GET /api/geoip/:ip

GeoIP lookup for a specific IP address.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns GeoIP data for an arbitrary IP address |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin role |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 hour (Redis) |
| **Response** | `GeoIpResult` |
| **Errors** | 401: Unauthorized, 403: Forbidden |

---

## Assistants Endpoints (Admin/Editor, JWT Required)

---

### GET /api/assistants/health

Health check for assistants service.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns health status of the AI assistants service |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin or editor role |
| **Rate Limit** | 30 req/min |
| **Cache** | No |
| **Response** | `{ status: string }` |

---

### POST /api/assistants/ceo/strategic-summary

Generate strategic summary for CEO.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `kpis` | object | Key performance indicators |
| `risks` | string[] | Current risks |
| `opportunities` | string[] | Current opportunities |

---

### POST /api/assistants/ceo/risk-alert

Get risk alert analysis for CEO.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `risk` | string | Risk description |
| `impact` | string | One of: `low`, `medium`, `high` |
| `context` | string | Additional context |

---

### POST /api/assistants/ceo/executive-summary

Generate executive summary.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `dashboardData` | object | Project/revenue/pipeline/team KPIs |
| `period` | string | Time period (e.g. "Q2 2026") |

---

### POST /api/assistants/ceo/strategic-risks

Identify strategic risks.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `revenueTrend` | number[] | Revenue trend data points |
| `projectDelays` | number | Count of delayed projects |
| `clientChurn` | number | Client churn rate |
| `teamTurnover` | number | Team turnover rate |
| `marketSignals` | string[] | Market signal descriptions |

---

### POST /api/assistants/ceo/board-report

Generate board report.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `quarter` | string | Quarter identifier (e.g. "Q2 2026") |
| `kpis` | object | Key performance indicator values |
| `initiatives` | array | `{ name: string, status: string, progress: number }[]` |

---

### POST /api/assistants/ceo/question

Ask CEO assistant a strategic question.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `question` | string | Strategic question |
| `context` | object | `{ dashboardData, recentDecisions }` |

---

### POST /api/assistants/sales/qualify-lead

Qualify a sales lead.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `company` | string | Company name |
| `contact` | string | Contact person |
| `budget` | string | Budget range |
| `timeline` | string | Project timeline |
| `requirements` | string | Project requirements |

---

### POST /api/assistants/sales/generate-proposal

Generate a sales proposal.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `clientName` | string | Client name |
| `projectType` | string | Type of project |
| `scope` | string[] | Scope items |
| `timeline` | string | Proposed timeline |
| `budget` | string | Proposed budget |

---

### POST /api/assistants/pm/plan-sprint

Plan a sprint with PM assistant.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `teamCapacity` | number | Available team capacity |
| `backlog` | string[] | Backlog items |
| `dependencies` | object | `Record<string, string[]>` |
| `velocity` | number | Historical velocity |

---

### POST /api/assistants/pm/predict-risk

Predict project risk.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projectData` | object | `{ timeline, team, complexity, budget }` |

---

### POST /api/assistants/visualization/lighting-design

Design lighting for a project.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projectType` | string | Project type |
| `style` | string | Design style |
| `space` | string | Space description |
| `mood` | string | Desired mood |
| `timeOfDay` | string | Time of day |
| `constraints` | string[] | Design constraints |

---

### POST /api/assistants/visualization/lighting-from-reference

Recommend lighting from reference image description.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `referenceImageDescription` | string | Description of reference |
| `targetSpace` | string | Target space to design for |

---

### POST /api/assistants/visualization/material-recommendations

Get material recommendations.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projectType` | string | Project type |
| `style` | string | Design style |
| `referenceImages` | string[] | Reference image URLs/descriptions |
| `sustainability` | boolean | Whether to prioritize sustainable materials |

---

### POST /api/assistants/visualization/material-from-reference

Match material from reference image.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `referenceDescription` | string | Reference material description |
| `targetElement` | string | Target element to recommend for |

---

### POST /api/assistants/analytics/forecast-timeline

Forecast project timeline.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projectType` | string | Project type |
| `complexity` | number | Complexity rating |
| `teamSize` | number | Team size |
| `scopeItems` | number | Number of scope items |
| `historicalVelocity` | number | Historical velocity metric |

---

### POST /api/assistants/analytics/assess-risks

Assess project risks.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projectData` | object | `{ timeline, team, complexity, budget, scopeChanges, dependencies }` |

---

### POST /api/assistants/analytics/optimize-resources

Optimize resource allocation.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projects` | array | `{ id, team, deadline, priority }[]` |
| `availableTeam` | number | Available team members |

---

### POST /api/assistants/analytics/forecast-budget

Forecast project budget.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `projectType` | string | Project type |
| `scopeItems` | string[] | Scope items |
| `timeline` | string | Timeline |
| `teamRate` | number | Team hourly/daily rate |

---

## Translations Endpoints (Admin/Editor, JWT Required)

---

### GET /api/translations/export/:locale

Export translations for a locale.

| Attribute | Value |
|-----------|-------|
| **Description** | Exports all translation key/value pairs for a specific locale |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin or editor role |
| **Rate Limit** | 30 req/min |
| **Cache** | 5 minutes |
| **Response** | `TranslationExport` |
| **Errors** | 401: Unauthorized, 403: Forbidden |

---

### POST /api/translations/import/:locale

Import translations for a locale.

| Attribute | Value |
|-----------|-------|
| **Description** | Imports a set of translation key/value pairs for a locale |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin or editor role |
| **Rate Limit** | 10 req/min |
| **Cache** | No |
| **Response** | `{ updated: number }` |
| **Errors** | 401: Unauthorized, 403: Forbidden |

---

### GET /api/translations/status

Get translation status for all locales.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns translation completion percentages for each locale |
| **Auth** | JWT (Bearer) |
| **Permissions** | Admin or editor role |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |
| **Response** | `TranslationStatus[]` |
| **Errors** | 401: Unauthorized, 403: Forbidden |

---

## Accounting Endpoints (JWT Required)

---

### GET /api/accounting/chart-of-accounts

Get chart of accounts.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns the full chart of accounts from Odoo |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | 5 minutes |
| **Response** | Chart of accounts data |

---

### GET /api/accounting/journals

Get all journals.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all accounting journals |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | 5 minutes |

---

### GET /api/accounting/taxes

Get all taxes.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns all configured tax rates |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | 5 minutes |

---

### GET /api/accounting/invoices

Get invoices.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 50 | Items per page |
| `offset` | integer | 0 | Pagination offset |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns accounting invoices with pagination |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |

---

### GET /api/accounting/journal-entries

Get journal entries.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 50 | Items per page |
| `offset` | integer | 0 | Pagination offset |

| Attribute | Value |
|-----------|-------|
| **Description** | Returns accounting journal entries with pagination |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |

---

### GET /api/accounting/dashboard

Get accounting dashboard summary.

| Attribute | Value |
|-----------|-------|
| **Description** | Returns aggregated accounting KPIs and summaries |
| **Auth** | JWT (Bearer) |
| **Permissions** | Any authenticated user |
| **Rate Limit** | 30 req/min |
| **Cache** | 1 minute |

---

## Webhook Endpoints

---

### POST /api/odoo/webhook

Receive Odoo webhook events (HMAC-signed).

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-odoo-signature` | Yes | HMAC-SHA256 hex digest of raw request body |

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `model` | string | Odoo model name (e.g. "project.project") |
| `id` | integer | Record ID |
| `action` | string | Action type (create, write, unlink) |
| `data` | object | Changed field data |

| Attribute | Value |
|-----------|-------|
| **Description** | Receives real-time change notifications from Odoo. Validates HMAC signature, routes through sync service |
| **Auth** | HMAC-SHA256 signature |
| **Rate Limit** | 60 req/min |
| **Cache** | No |
| **Response** | `{ success: true, message: "Webhook processed" }` |
| **Errors** | 401: Invalid signature |

---

### POST /api/strapi/webhook

Receive Strapi webhook events.

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-strapi-secret` | Yes | Shared secret configured in Strapi |

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type (entry.create, entry.update, entry.delete, entry.publish, entry.unpublish) |
| `model` | string | Content type (currently only "portfolio" is processed) |
| `entry` | object | Entry data, must contain `slug` |

| Attribute | Value |
|-----------|-------|
| **Description** | Receives CMS change notifications from Strapi. Validates secret header, syncs portfolio entries to Odoo |
| **Auth** | Shared secret header |
| **Rate Limit** | 60 req/min |
| **Cache** | No |
| **Response** | `{ success: true, message: "Webhook processed" }` |
| **Errors** | 401: Invalid secret |

---

## Odoo API Endpoints (Admin Only, JWT Required)

---

### CRM Pipeline & Leads

#### GET /api/odoo/crm/pipeline

Get CRM pipeline summary by stage.

#### GET /api/odoo/crm/leads

List CRM leads.

**Query Parameters:** `limit` (int, default 50), `offset` (int, default 0)

#### GET /api/odoo/crm/leads/:id

Get lead detail.

#### POST /api/odoo/crm/leads

Create a new CRM lead.

#### PATCH /api/odoo/crm/leads/:id

Update a CRM lead.

#### DELETE /api/odoo/crm/leads/:id

Archive a CRM lead.

---

### Contacts / Partners

#### GET /api/odoo/contacts

List contacts/partners.

**Query Parameters:** `limit` (int, 50), `offset` (int, 0), `search` (string)

#### GET /api/odoo/contacts/:id

Get contact detail.

#### POST /api/odoo/contacts

Create a new contact/partner.

#### PATCH /api/odoo/contacts/:id

Update a contact/partner.

---

### Projects

#### GET /api/odoo/projects

List Odoo projects.

**Query Parameters:** `limit` (int, 50), `offset` (int, 0)

#### GET /api/odoo/projects/:id

Get project detail.

#### PATCH /api/odoo/projects/:id

Update a project.

#### GET /api/odoo/projects/:id/milestones

Get project milestones.

#### POST /api/odoo/projects/:id/milestones

Add a milestone to a project.

#### PATCH /api/odoo/milestones/:id

Update a milestone.

---

### Sales, Invoices & Quotations

#### GET /api/odoo/sales/orders

List sales orders.

**Query Parameters:** `limit` (int, 50), `offset` (int, 0)

#### GET /api/odoo/invoices

List customer invoices.

**Query Parameters:** `limit` (int, 50), `offset` (int, 0)

#### GET /api/odoo/quotations

List sales quotations.

**Query Parameters:** `limit` (int, 50), `offset` (int, 0), `state` (string: draft, sent, sale, done, cancel)

#### GET /api/odoo/quotations/:id

Get quotation detail.

#### GET /api/odoo/quotations/:id/lines

Get quotation line items.

#### POST /api/odoo/quotations

Create a new quotation.

#### PATCH /api/odoo/quotations/:id

Update a quotation.

---

### Activities & Tasks

#### GET /api/odoo/activities

List activities (mail.activity).

**Query Parameters:** `limit` (50), `offset` (0), `resModel` (string), `resId` (int)

#### POST /api/odoo/activities

Create a new activity.

#### PATCH /api/odoo/activities/:id

Update an activity.

#### POST /api/odoo/activities/:id/complete

Mark an activity as completed.

#### GET /api/odoo/tasks

List project tasks.

**Query Parameters:** `limit` (50), `offset` (0), `projectId` (int)

#### GET /api/odoo/tasks/:id

Get task detail.

#### POST /api/odoo/tasks

Create a new project task.

#### PATCH /api/odoo/tasks/:id

Update a project task.

---

### Helpdesk

#### GET /api/odoo/helpdesk/tickets

List Helpdesk tickets.

**Query Parameters:** `limit` (50), `offset` (0)

#### GET /api/odoo/helpdesk/tickets/:id

Get ticket detail.

#### POST /api/odoo/helpdesk/tickets

Create a Helpdesk ticket.

#### PATCH /api/odoo/helpdesk/tickets/:id

Update a Helpdesk ticket.

---

### HR / Employees

#### GET /api/odoo/employees

List employees (hr.employee).

**Query Parameters:** `limit` (50), `offset` (0)

#### GET /api/odoo/employees/:id

Get employee detail.

---

### Timesheets

#### GET /api/odoo/timesheets

List timesheets (account.analytic.line).

**Query Parameters:** `limit` (50), `offset` (0), `projectId` (int)

#### POST /api/odoo/timesheets

Create a timesheet entry.

---

### Knowledge & Calendar

#### GET /api/odoo/knowledge/articles

List knowledge articles.

**Query Parameters:** `limit` (50), `offset` (0)

#### GET /api/odoo/knowledge/articles/:id

Get knowledge article detail.

#### GET /api/odoo/calendar/events

List calendar events.

**Query Parameters:** `limit` (50), `offset` (0)

#### POST /api/odoo/calendar/events

Create a calendar event.

---

### Communications

#### GET /api/odoo/messages

List mail messages.

**Query Parameters:** `limit` (50), `offset` (0), `resModel` (string), `resId` (int)

#### POST /api/odoo/messages

Post a mail message.

---

### Documents

#### POST /api/odoo/documents/:projectId

Upload a file and link it to an Odoo project (multipart, max 50MB).

#### GET /api/odoo/documents/:projectId

List documents linked to an Odoo project.

#### GET /api/odoo/documents/download/:id

Get signed download URL for a document.

#### DELETE /api/odoo/documents/:projectId/:id

Delete a document linked to an Odoo project.

---

### Sync & Health

#### GET /api/odoo/sync/state

Get Odoo sync state.

#### POST /api/odoo/sync/trigger

Trigger a manual Odoo pull.

#### GET /api/odoo/health

Check Odoo connection health.

#### GET /api/odoo/company/settings

Get Odoo company settings.

**Query Parameters:** `companyId` (int, optional)

#### GET /api/odoo/dashboard/executive

Get Executive Hub Dashboard metrics (aggregated cross-module SOT payload).

---

## Webhook Config Endpoints (Admin Only, JWT Required)

#### GET /api/webhooks

Get all webhook configurations.

**Query Parameters:** `page` (int, 1), `limit` (int, 20)

#### GET /api/webhooks/:id

Get webhook configuration by ID.

#### POST /api/webhooks

Create a new webhook configuration.

#### PATCH /api/webhooks/:id

Update a webhook configuration.

#### DELETE /api/webhooks/:id

Delete a webhook configuration.

#### PATCH /api/webhooks/:id/toggle

Toggle webhook active status.

---

## Endpoint Summary Table

| # | Method | Path | Auth | Role |
|---|--------|------|------|------|
| 1 | GET | `/achievements` | None | Public |
| 2 | GET | `/articles` | None | Public |
| 3 | GET | `/articles/:slug` | None | Public |
| 4 | GET | `/services` | None | Public |
| 5 | GET | `/services/:slug` | None | Public |
| 6 | GET | `/projects` | None | Public |
| 7 | GET | `/projects/:slug` | None | Public |
| 8 | GET | `/projects/:slug/similar` | None | Public |
| 9 | GET | `/pages` | None | Public |
| 10 | GET | `/pages/:slug` | None | Public |
| 11 | GET | `/team-members` | None | Public |
| 12 | GET | `/team-members/:slug` | None | Public |
| 13 | GET | `/testimonials` | None | Public |
| 14 | GET | `/testimonials/featured` | None | Public |
| 15 | GET | `/testimonials/:id` | None | Public |
| 16 | GET | `/faqs` | None | Public |
| 17 | GET | `/faqs/category/:category` | None | Public |
| 18 | GET | `/faqs/:id` | None | Public |
| 19 | GET | `/currency/list` | None | Public |
| 20 | GET | `/currency/:code` | None | Public |
| 21 | GET | `/currency/rates` | None | Public |
| 22 | POST | `/pricing/calculate` | None | Public |
| 23 | GET | `/pricing/preview` | None | Public |
| 24 | GET | `/geoip` | None | Public |
| 25 | POST | `/vector/search/public` | None | Public |
| 26 | GET | `/vector/recommendations/:slug` | None | Public |
| 27 | GET | `/health` | None | Public |
| 28 | GET | `/mobile/health` | None | Public |
| 29 | POST | `/contact` | None | Public |
| 30 | POST | `/mobile/register` | None | Public |
| 31 | POST | `/mobile/login` | None | Public |
| 32 | POST | `/auth/register` | None | Public |
| 33 | POST | `/auth/login` | None | Public |
| 34 | POST | `/auth/forgot-password` | None | Public |
| 35 | POST | `/auth/reset-password` | None | Public |
| 36 | GET | `/auth/me` | JWT | User |
| 37 | POST | `/auth/refresh` | JWT | User |
| 38 | POST | `/auth/refresh-token` | Refresh Token | User |
| 39 | POST | `/auth/logout` | CSRF | User |
| 40 | POST | `/auth/change-password` | JWT | User |
| 41 | GET | `/users/me` | JWT | User |
| 42 | GET | `/users/:id` | JWT | User |
| 43 | POST | `/requests` | JWT | User |
| 44 | GET | `/requests/client/:clientId` | JWT | User |
| 45 | PATCH | `/requests/:id/status` | JWT | User |
| 46 | POST | `/requests/admin` | JWT | Admin |
| 47 | GET | `/storage/download-url` | JWT | User |
| 48 | GET | `/storage/upload-url` | JWT | User |
| 49 | POST | `/agents/chat` | JWT | User |
| 50 | POST | `/agents/deep-research` | JWT | User |
| 51 | POST | `/portal/me` | JWT | Portal |
| 52 | GET | `/portal/dashboard` | JWT | Portal |
| 53 | GET | `/portal/odoo/projects` | JWT | Portal |
| 54 | GET | `/portal/odoo/projects/:id/milestones` | JWT | Portal |
| 55 | GET | `/portal/odoo/invoices` | JWT | Portal |
| 56 | GET | `/portal/projects/:projectId/detail` | JWT | Portal |
| 57 | GET | `/portal/projects/:projectId/tasks` | JWT | Portal |
| 58 | GET | `/portal/projects/:projectId/team` | JWT | Portal |
| 59 | POST | `/portal/projects/:projectId/documents` | JWT | Portal |
| 60 | GET | `/portal/projects/:projectId/documents` | JWT | Portal |
| 61 | DELETE | `/portal/projects/:projectId/documents/:documentId` | JWT | Portal |
| 62 | GET | `/portal/notifications/preferences` | JWT | User |
| 63 | PUT | `/portal/notifications/preferences` | JWT | User |
| 64 | POST | `/portal/copilot/query` | JWT | Portal |
| 65 | POST | `/vector/search` | JWT | User |
| 66 | POST | `/vector/sync/all` | JWT | User |
| 67 | POST | `/vector/sync/:slug` | JWT | User |
| 68 | POST | `/vector/tags/:slug` | JWT | User |
| 69 | POST | `/vector/lighting/:slug` | JWT | User |
| 70 | POST | `/approvals/submit` | JWT | User |
| 71 | PATCH | `/approvals/:id/review` | JWT | User |
| 72 | GET | `/approvals/project/:projectId` | JWT | User |
| 73 | POST | `/annotations` | JWT | User |
| 74 | PATCH | `/annotations/:id/resolve` | JWT | User |
| 75 | GET | `/annotations/project/:projectId` | JWT | User |
| 76 | POST | `/projects` | JWT | Admin |
| 77 | PATCH | `/projects/:slug/status` | JWT | Admin |
| 78 | GET | `/accounting/chart-of-accounts` | JWT | User |
| 79 | GET | `/accounting/journals` | JWT | User |
| 80 | GET | `/accounting/taxes` | JWT | User |
| 81 | GET | `/accounting/invoices` | JWT | User |
| 82 | GET | `/accounting/journal-entries` | JWT | User |
| 83 | GET | `/accounting/dashboard` | JWT | User |
| 84 | POST | `/currency/sync-rates` | JWT | Admin |
| 85 | GET | `/geoip/:ip` | JWT | Admin |
| 86 | GET | `/translations/export/:locale` | JWT | Admin/Editor |
| 87 | POST | `/translations/import/:locale` | JWT | Admin/Editor |
| 88 | GET | `/translations/status` | JWT | Admin/Editor |
| 89 | GET | `/assistants/health` | JWT | Admin/Editor |
| 90 | POST | `/assistants/ceo/strategic-summary` | JWT | Admin/Editor |
| 91 | POST | `/assistants/ceo/risk-alert` | JWT | Admin/Editor |
| 92 | POST | `/assistants/ceo/executive-summary` | JWT | Admin/Editor |
| 93 | POST | `/assistants/ceo/strategic-risks` | JWT | Admin/Editor |
| 94 | POST | `/assistants/ceo/board-report` | JWT | Admin/Editor |
| 95 | POST | `/assistants/ceo/question` | JWT | Admin/Editor |
| 96 | POST | `/assistants/sales/qualify-lead` | JWT | Admin/Editor |
| 97 | POST | `/assistants/sales/generate-proposal` | JWT | Admin/Editor |
| 98 | POST | `/assistants/pm/plan-sprint` | JWT | Admin/Editor |
| 99 | POST | `/assistants/pm/predict-risk` | JWT | Admin/Editor |
| 100 | POST | `/assistants/visualization/lighting-design` | JWT | Admin/Editor |
| 101 | POST | `/assistants/visualization/lighting-from-reference` | JWT | Admin/Editor |
| 102 | POST | `/assistants/visualization/material-recommendations` | JWT | Admin/Editor |
| 103 | POST | `/assistants/visualization/material-from-reference` | JWT | Admin/Editor |
| 104 | POST | `/assistants/analytics/forecast-timeline` | JWT | Admin/Editor |
| 105 | POST | `/assistants/analytics/assess-risks` | JWT | Admin/Editor |
| 106 | POST | `/assistants/analytics/optimize-resources` | JWT | Admin/Editor |
| 107 | POST | `/assistants/analytics/forecast-budget` | JWT | Admin/Editor |
| 108 | POST | `/odoo/webhook` | HMAC | Webhook |
| 109 | POST | `/strapi/webhook` | Secret | Webhook |
| 110-155 | GET/POST/PATCH/DELETE | `/odoo/*` (46 endpoints) | JWT | Admin |
| 156-161 | GET/POST/PATCH/DELETE | `/webhooks` (6 endpoints) | JWT | Admin |

---

## Related Documents

- [API Architecture](API_ARCHITECTURE.md) — Design principles and patterns
- [API Standards](../engineering/API_STANDARDS.md) — Request/response conventions
- [Authentication](AUTHENTICATION.md) — Auth flows and token management
- [Authorization](AUTHORIZATION.md) — Role-based access control
- [Error Codes](error-codes.md) — Full error code reference
- [Webhooks](WEBHOOKS.md) — Webhook event reference