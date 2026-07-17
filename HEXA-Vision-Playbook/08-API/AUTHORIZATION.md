# 🔐 Authorization

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Pattern:** RBAC + Scopes

## Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full system access | All operations |
| **Manager** | Lead and project management | Create/edit/delete projects, manage leads |
| **User** | Self-service access | View own data, create projects |
| **Guest** | Public access | View public projects, search |

---

## Role-Based Access Control (RBAC)

### Admin Role
- ✓ Access all users and data
- ✓ System configuration
- ✓ User management
- ✓ Analytics and reporting

### Manager Role
- ✓ Create and manage projects
- ✓ Manage leads
- ✓ View team analytics
- ✗ No system configuration
- ✗ Cannot access other users' data

### User Role
- ✓ Create own projects
- ✓ View own projects
- ✓ Submit leads
- ✗ Cannot manage other users
- ✗ Cannot access admin features

### Guest Role (Public API)
- ✓ View public projects
- ✓ Search projects
- ✗ Cannot create or modify
- ✗ No authentication required

---

## Scopes

API keys can be restricted to specific scopes:

```
scope="projects:read projects:write leads:read"
```

### Available Scopes
- `projects:read` - Read project data
- `projects:write` - Create/update projects
- `users:read` - Read user data
- `users:write` - Manage users
- `leads:read` - Read leads
- `leads:write` - Create/update leads
- `analytics:read` - Access analytics

---

## Permission Check Examples

### Project Access
```typescript
if (project.owner_id !== user.id && user.role !== 'admin') {
  throw new ForbiddenException('Access denied');
}
```

### Role Check
```typescript
if (user.role !== 'admin') {
  throw new ForbiddenException('Admin access required');
}
```

---

## API Key Management

### Creating API Keys
```
POST /users/:id/api-keys
{
  "name": "Mobile App",
  "scopes": ["projects:read", "leads:write"],
  "expires_in": 365  // days
}
```

### Using API Keys
```
Authorization: Bearer {api_key}
```

---

## JWT Tokens

### Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "scopes": ["projects:read", "projects:write"],
  "iat": 1626432000,
  "exp": 1626435600
}
```

### Token Lifecycle
- **Access Token:** 1 hour expiration
- **Refresh Token:** 7 days expiration
- **Refresh Endpoint:** `POST /auth/refresh`

---

## Related Documentation

- [Authentication Flow](../01-ARCHITECTURE/authentication-flow.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Security Standards](../06-STANDARDS/SECURITY.md)
