# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within HEXA Studio, please send an email to security@hexastudio.net. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Security Practices

### Authentication & Authorization
- JWT-based authentication with secure token storage
- Role-based access control (RBAC) for admin and client portals
- Session management with automatic expiration

### Data Protection
- All data encrypted in transit (TLS 1.3)
- Sensitive data encrypted at rest
- Environment variables for all secrets and API keys
- No secrets committed to version control

### Infrastructure
- Automated security scanning in CI/CD
- Regular dependency updates
- Docker image scanning
- Network isolation between services

### API Security
- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS configuration
- SQL injection prevention via parameterized queries

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be published to the `main` branch and tagged for release.

## Best Practices for Contributors

1. Never commit secrets, API keys, or credentials
2. Use environment variables for sensitive configuration
3. Follow secure coding practices
4. Validate all user inputs
5. Use parameterized queries for database operations
6. Keep dependencies up to date
