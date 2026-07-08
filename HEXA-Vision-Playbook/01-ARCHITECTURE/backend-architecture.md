# Backend Architecture

**Last Updated:** 2026-07-08

---

## Technology

- **Framework:** NestJS (latest)
- **Language:** TypeScript (strict mode)
- **API:** REST with Swagger documentation
- **Auth:** JWT (RS256) with Passport strategies
- **Validation:** class-validator + ValidationPipe
- **ORM:** TypeORM (PostgreSQL)

## Module Structure

```
apps/backend/src/
├── main.ts                       # Entry point
├── app.module.ts                 # Root module
├── app.controller.ts             # Health check
├── config/
│   ├── database.config.ts        # Database configuration
│   ├── auth.config.ts            # JWT configuration
│   └── app.config.ts             # General configuration
├── common/
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       └── roles.decorator.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   ├── projects/
│   ├── contacts/
│   ├── content/
│   │   ├── content.module.ts
│   │   ├── content.controller.ts
│   │   ├── content.service.ts
│   │   └── clients/
│   │       ├── strapi.client.ts       # Strapi HTTP client
│   │       └── odoo.client.ts         # Odoo XML-RPC client
│   └── portal/
└── migrations/
```

## Request Lifecycle

```
Incoming Request
    │
    ▼
Guard (JWT auth) ─── 401 if invalid
    │
    ▼
Interceptor (Logging)
    │
    ▼
Validation Pipe (DTO validation) ─── 400 if invalid
    │
    ▼
Controller (Route handler)
    │
    ▼
Service (Business logic)
    │
    ├── Repository (Database)
    ├── Strapi Client (CMS)
    └── Odoo Client (ERP)
    │
    ▼
Interceptor (Response transform)
    │
    ▼
Response
```

## Integration Architecture

### Strapi Client

```typescript
@Injectable()
export class StrapiClient {
  constructor(private httpService: HttpService) {}

  async getProjects(): Promise<StrapiProject[]> {
    const { data } = await this.httpService
      .get(`${this.config.get('STRAPI_URL')}/api/projects`, {
        headers: { Authorization: `Bearer ${this.config.get('STRAPI_TOKEN')}` },
      })
      .pipe(timeout(5000))
      .toPromise();
    return data.data;
  }
}
```

### Odoo Client

```typescript
@Injectable()
export class OdooClient {
  async createLead(contact: CreateContactDto): Promise<number> {
    const models = new OdooXMLRPC({
      url: this.config.get('ODOO_URL'),
      db: this.config.get('ODOO_DB'),
      username: this.config.get('ODOO_USER'),
      password: this.config.get('ODOO_PASSWORD'),
    });

    const leadId = await models.execute_kw('crm.lead', 'create', [{
      name: contact.name,
      email_from: contact.email,
      description: contact.message,
    }]);

    return leadId;
  }
}
```

## Error Response Structure

All errors follow the RFC 7807 Problem Details format:

```json
{
  "type": "https://api.hexastudio.net/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "email must be a valid email address",
  "instance": "/v1/contacts",
  "timestamp": "2026-07-08T12:00:00Z"
}
```
