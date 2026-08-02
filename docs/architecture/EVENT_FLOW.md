# ⚡ EVENT FLOW: THE INTERACTIVE NERVOUS SYSTEM

**Version:** 1.0 | **Domain:** Architecture | **Focus:** Asynchronous Events

## 1. THE EVENT-DRIVEN PHILOSOPHY
HEXA Vision is not just a request-response system; it is a **Reactive Experience**. Every significant action is an "Event" that can trigger a chain of reactions across the system.

---

## 2. PRIMARY EVENT CATEGORIES

### I. User Experience Events (Frontend)
Events triggered by the user interacting with the 3D scene.
- `ON_HOTSPOT_CLICK` $\rightarrow$ Trigger camera transition $\rightarrow$ Open info panel.
- `ON_MATERIAL_CHANGE` $\rightarrow$ Update 3D mesh $\rightarrow$ Sync to backend.
- `ON_SCENE_LOADED` $\rightarrow$ Trigger "Entrance" animation $\rightarrow$ Enable navigation.

### II. System Events (Backend)
Events triggered by changes in the infrastructure or content.
- `ON_ASSET_UPLOAD` $\rightarrow$ Trigger Draco compression $\rightarrow$ Update manifest.
- `ON_SPRINT_COMPLETED` $\rightarrow$ Update `PROJECT_STATUS.md` $\rightarrow$ Notify stakeholders.
- `ON_AUTH_EXPIRED` $\rightarrow$ Trigger session refresh $\rightarrow$ Redirect to login.

### III. Integration Events (CMS/External)
Events originating from Strapi or external APIs.
- `STRAPI_WEBHOOK_UPDATE` $\rightarrow$ Invalidate Redis cache $\rightarrow$ Trigger ISR in Next.js.
- `MINIO_FILE_DELETED` $\rightarrow$ Update asset manifest $\rightarrow$ Remove reference in UI.

---

## 3. THE EVENT PIPELINE

`Trigger` $\rightarrow$ `Event Bus / Controller` $\rightarrow$ `Handler` $\rightarrow$ `State Update` $\rightarrow$ `Visual Feedback`

**Example: Changing a Project Material**
1. **Trigger:** User clicks "Gold Finish" button.
2. **Handler:** NestJS `MaterialService` updates the Strapi entry.
3. **State Update:** Strapi sends a webhook to NestJS.
4. **Visual Feedback:** NestJS pushes a WebSocket update to the Frontend $\rightarrow$ R3F updates the material in real-time.

---

## 4. EVENT CONSTRAINTS & PERFORMANCE

- **Debouncing:** High-frequency events (e.g., scroll or mouse move) must be debounced to avoid overloading the CPU.
- **Idempotency:** All events must be idempotent. Processing the same event twice must not change the result.
- **Asynchronicity:** Heavy events (like asset optimization) must be handled in background queues to avoid blocking the main API.

*“An event is a promise of change. The flow is how we fulfill that promise.”*
