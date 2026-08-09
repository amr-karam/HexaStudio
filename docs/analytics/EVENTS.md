# 🏷️ EVENT TRACKING SCHEMA & TELEMETRY STANDARDS

**Version:** 1.0.0 | **Scope:** Client & Server Event Tracking | **Standard:** Universal Analytics Event Schema

---

## 1. OVERVIEW & SCHEMA

All client and backend analytical events adhere to a unified JSON schema shipped via PostHog / GA4 abstraction layer (`apps/frontend/src/lib/analytics/provider.ts`).

---

## 2. EVENT INTERFACE

```typescript
export interface AnalyticsEvent {
  eventName: string;
  category: "acquisition" | "engagement" | "conversion" | "xr" | "portal";
  timestamp: string;
  userId?: string;
  sessionId: string;
  properties?: Record<string, unknown>;
}
```

---

## 3. CORE TELEMETRY EVENTS

- `page_view`: Triggered on route change.
- `scene_loaded`: Triggered when 3D WebGL canvas finishes asset loading.
- `portal_approval`: Triggered when client approves project milestone.
- `xr_session_start`: Triggered when WebXR session initiates.

---

## 4. RELATED DOCUMENTATION

- [BI.md](BI.md)) — BI pipeline.
