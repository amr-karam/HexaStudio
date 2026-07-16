# Core Web Vitals RUM Monitoring

## Implementation Status
✅ **Implemented** - `apps/frontend/src/components/WebVitals.tsx`

## Current Implementation
- Uses `next/web-vitals` `useReportWebVitals` hook
- Reports: CLS, FID, LCP, FCP, TTFB, INP
- Sends via `navigator.sendBeacon` (fallback to `fetch` with `keepalive`)
- Configurable endpoint via `NEXT_PUBLIC_VITALS_ENDPOINT`
- Development mode logs to console

## Data Collected
| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| **CLS** | Cumulative Layout Shift | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FID** | First Input Delay | < 100ms | 100-300ms | > 300ms |
| **LCP** | Largest Contentful Paint | < 2.5s | 2.5-4s | > 4s |
| **FCP** | First Contentful Paint | < 1.8s | 1.8-3s | > 3s |
| **TTFB** | Time to First Byte | < 800ms | 800-1800ms | > 1800ms |
| **INP** | Interaction to Next Paint | < 200ms | 200-500ms | > 500ms |

## Backend Endpoint (To Implement)
Create API route to receive vitals:

```typescript
// apps/backend/src/modules/vitals/vitals.controller.ts
@Post('vitals')
@HttpCode(202)
async receiveVitals(@Body() vitals: WebVitalMetric) {
  // Store in Redis with TTL or push to Prometheus
  await this.redis.lpush('web:vitals', JSON.stringify(vitals));
  await this.redis.ltrim('web:vitals', 0, 9999);
  return { accepted: true };
}
```

## Data Pipeline
```
Browser → sendBeacon → /api/vitals → Redis (rolling buffer)
                    ↓
            Prometheus Exporter → Grafana Dashboard
                    ↓
            Alerting (p95 LCP > 2.5s, CLS > 0.1)
```

## Grafana Dashboard Queries
```promql
# LCP p75
histogram_quantile(0.75, sum(rate(web_vitals_lcp_bucket[5m])) by (le))

# CLS p75
histogram_quantile(0.75, sum(rate(web_vitals_cls_bucket[5m])) by (le))

# INP p75
histogram_quantile(0.75, sum(rate(web_vitals_inp_bucket[5m])) by (le))

# Good/Negative/Poor distribution
sum(rate(web_vitals_rating_total{rating="good"}[5m])) by (name)
```

## Alerts
```yaml
- alert: LCPPoor
  expr: histogram_quantile(0.75, sum(rate(web_vitals_lcp_bucket[5m])) by (le)) > 2.5
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "LCP p75 > 2.5s"

- alert: CLSPoor
  expr: histogram_quantile(0.75, sum(rate(web_vitals_cls_bucket[5m])) by (le)) > 0.1
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "CLS p75 > 0.1"

- alert: INPPoor
  expr: histogram_quantile(0.75, sum(rate(web_vitals_inp_bucket[5m])) by (le)) > 200
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "INP p75 > 200ms"
```

## Current Configuration
```env
# .env.production
NEXT_PUBLIC_VITALS_ENDPOINT=https://api.hexastudio.net/api/vitals
```

## Next Steps
1. [ ] Implement `/api/vitals` endpoint in backend
2. [ ] Add Prometheus metrics export for vitals
3. [ ] Create Grafana "Web Vitals" dashboard
4. [ ] Configure alerts in Prometheus/Alertmanager
5. [ ] Add to CI/CD: Lighthouse CI already enforces budgets