# Authentication API

**Base:** `/v1/auth`

---

## Register

```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

### Response (201)

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-07-08T12:00:00Z"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid input (validation) |
| 409 | Email already registered |

---

## Login

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Response (200)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["user"]
    }
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 401 | Invalid credentials |
| 429 | Too many attempts |

---

## Refresh Token

```http
POST /v1/auth/refresh
Content-Type: application/json
Authorization: Bearer <refresh_token>

{
  "refreshToken": "refresh-token-value"
}
```

### Response (200)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 401 | Invalid or expired refresh token |

---

## Logout

```http
POST /v1/auth/logout
Authorization: Bearer <access_token>
```

### Response (200)

```json
{
  "message": "Logged out successfully"
}
```

---

## Forgot Password

```http
POST /v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Response (200)

```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

> Note: Response is the same whether email exists or not (prevents enumeration).

---

## Reset Password

```http
POST /v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass456!"
}
```

### Response (200)

```json
{
  "message": "Password reset successfully"
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid or expired token |
| 400 | Password does not meet requirements |

---

## Get Current User

```http
GET /v1/auth/me
Authorization: Bearer <access_token>
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"],
    "createdAt": "2026-07-08T12:00:00Z"
  }
}
```
