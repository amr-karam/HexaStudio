# Event Tracking Specifications

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Event Schema

All events must follow this structured format:

```typescript
interface AnalyticsEvent {
  eventName: string;        // e.g., 'project_viewed'
  category: string;          // e.g., 'engagement'
  timestamp: string;         // ISO 8601
  userId?: string;           // UUID if authenticated
  sessionId: string;         // Unique session ID
  properties: Record<string, any>; // Event-specific data
}
```

## Critical Event Map

### 1. Acquisition (Top of Funnel)
| Event Name | Trigger | Properties |
|------------|---------|-------------|
| `page_view` | Page load | `page_path`, `referrer`, `device` |
| `scroll_depth` | User reaches 25%, 50%, 75%, 100% | `percentage`, `page_path` |
| `cta_click` | Click on any primary CTA | `cta_id`, `page_path`, `location` |

### 2. Engagement (Middle of Funnel)
| Event Name | Trigger | Properties |
|------------|---------|-------------|
| `project_opened` | Project detail page load | `project_slug`, `category` |
| `scene_loaded` | 3D canvas becomes interactive | `project_slug`, `load_time_ms` |
| `hotspot_clicked` | Interaction with 3D hotspot | `hotspot_id`, `project_slug` |
| `model_rotated` | Significant camera movement | `project_slug`, `duration` |
| `video_played` | Start of a project video | `video_id`, `project_slug` |

### 3. Conversion (Bottom of Funnel)
| Event Name | Trigger | Properties |
|------------|---------|-------------|
| `form_start` | First field focus in contact form | `form_id` |
| `form_submit` | Successful contact submission | `form_id`, `service_type` |
| `portal_login` | Successful login to portal | `userId`, `method` |
| `file_downloaded` | Client downloads a deliverable | `file_id`, `project_id` |

## Implementation Guide

### Frontend Integration (Next.js)

```typescript
// lib/analytics.ts
export const trackEvent = (name: string, category: string, props: Record<string, any> = {}) => {
  // 1. Send to GA4
  window.gtag('event', name, { event_category: category, ...props });
  
  // 2. Send to internal backend for BI
  fetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({ eventName: name, category, properties: props }),
  });
};

// Usage in component
<button onClick={() => trackEvent('cta_click', 'engagement', { cta_id: 'hero_contact' })}>
  Contact Us
</button>
```

## Data Validation

- **Event Audit:** Monthly check to ensure events are still firing correctly.
- **Naming Consistency:** No new event names allowed without updating this document.
- **Latency:** Analytics calls must be non-blocking and asynchronous.
