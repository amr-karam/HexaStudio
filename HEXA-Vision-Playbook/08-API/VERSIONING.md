# 📦 API Versioning

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Current Version:** v1

## Versioning Strategy

### URL-Based Versioning
Each API version is accessible via URL path:
```
https://api.hexastudio.net/api/v1/  # v1 endpoints
https://api.hexastudio.net/api/v2/  # v2 endpoints (future)
```

**Advantages:**
- ✓ Clear version visibility
- ✓ Easy to route
- ✓ Supports multiple versions simultaneously

---

## Version Lifecycle

### Active Support
- **Current Version (v1):** Receives all new features and bug fixes
- **Support Duration:** Minimum 12 months

### Deprecation Timeline
1. **Announcement (Month 1):** Announce upcoming EOL
2. **Deprecation (Months 2-6):** Return `Deprecation` header
3. **EOL (Month 12):** Version no longer supported
4. **Sunset (Month 13):** Version endpoints disabled

### Deprecation Header
```
Deprecation: true
Sunset: Sun, 15 Jul 2027 00:00:00 GMT
Link: <https://docs.hexastudio.net/migration-v2>; rel="successor-version"
```

---

## Breaking Changes Policy

### Non-Breaking (Backwards Compatible)
No major version bump needed:
- ✓ Adding optional parameters
- ✓ Adding new endpoints
- ✓ Adding new response fields
- ✓ Bug fixes

### Breaking Changes
Require new major version:
- ✗ Removing/renaming fields
- ✗ Changing response structure
- ✗ Changing HTTP status codes
- ✗ Removing endpoints
- ✗ Changing authentication method

---

## Migration Guide

When upgrading versions:

1. **Review Changelog** - Check what's different
2. **Test Integration** - Test against new version first
3. **Update Client Code** - Update API calls if needed
4. **Deploy** - Roll out to production

---

## Future Versions

### v2 Planned Features
- GraphQL support
- WebSocket streaming
- Enhanced filtering
- (Tentative: Q4 2026)

---

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [API Standards](../06-STANDARDS/API_STANDARDS.md)
