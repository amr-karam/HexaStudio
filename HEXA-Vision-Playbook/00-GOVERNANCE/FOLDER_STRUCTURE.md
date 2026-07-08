# Folder Structure: HEXA Vision

This document describes the standardized folder structure for the HEXA Vision monorepo. All agents must adhere to this layout to ensure maintainability and scalability.

## 1. Root Level
- `/apps`: Contains the main deployable applications.
- `/packages`: Contains shared libraries used across multiple apps.
- `/docker`: Infrastructure as Code (IaC) and Docker configurations.
- `/docs`: High-level architectural and project documentation.
- `/scripts`: Automation scripts for setup, deployment, and maintenance.

---

## 2. Frontend (`/apps/frontend`)
The frontend follows a **Feature-Based Architecture**.

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`:
    - `ui/`: Pure, stateless, reusable UI components (Atomic Design - Atoms).
    - `common/`: Complex reusable components used across multiple features.
    - `layouts/`: Page-level layout wrappers.
- `src/features/`: Domain-specific logic. Each feature contains:
    - `components/`: Components used only within this feature.
    - `hooks/`: Feature-specific state and logic hooks.
    - `services/`: API call definitions for this feature.
    - `types/`: Feature-specific TypeScript interfaces.
    - `store/`: Feature-specific Zustand stores.
- `src/hooks/`: Global, reusable hooks (e.g., `useWindowSize`, `useLocalStorage`).
- `src/lib/`: Third-party library configurations (e.g., `three-setup.ts`, `gsap-config.ts`).
- `src/providers/`: React Context and Query providers.
- `src/stores/`: Global state management (Zustand).
- `src/types/`: Local frontend-only type definitions.

---

## 3. Backend (`/apps/backend`)
The backend follows a **Modular Architecture** based on NestJS best practices.

- `src/main.ts`: Entry point.
- `src/app.module.ts`: Root module.
- `src/core/`: Singleton services, global filters, interceptors, and guards.
- `src/common/`: Shared decorators, pipes, and utility classes.
- `src/modules/`: Feature-based modules. Each module contains:
    - `*.controller.ts`: Request handling.
    - `*.service.ts`: Business logic.
    - `*.module.ts`: Module definition.
    - `dto/`: Data Transfer Objects.
    - `entities/`: Database entity definitions.
    - `interfaces/`: Module-specific interfaces.
- `src/database/`: DB configuration, migrations, and seeders.
- `src/config/`: Environment variable validation and config schemas.

---

## 4. Shared Packages (`/packages`)
Used for cross-app consistency.

- `packages/types/`: 
    - `index.ts`: Exported shared interfaces (e.g., `User`, `Project`, `ApiResponse`).
- `packages/utils/`:
    - `index.ts`: Shared helper functions (e.g., `slugify`, `formatDate`).

---

## 5. Infrastructure (`/docker`)
- `traefik/`: Proxy configuration.
- `postgres/`: DB init scripts.
- `redis/`: Cache config.
- `minio/`: S3 bucket initialization.
- `prometheus/` & `grafana/`: Monitoring configs.
- `loki/`: Log aggregation configs.
