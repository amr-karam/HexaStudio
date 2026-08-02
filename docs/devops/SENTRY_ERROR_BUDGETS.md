# Sentry Error Budgets Configuration

## Overview
Error Budgets define the acceptable error rate for your application. When exceeded, they trigger alerts to prevent degraded user experience.

## Recommended Configuration in Sentry UI

### 1. Error Rate Alert (Critical)
**Settings > Alerts > Create Alert > Issues**

- **Name**: `Production - Error Rate Exceeded`
- **Condition**: 
  - **Metric**: Event Rate (events/minute)
  - **Threshold**: > 10 events/minute (adjust based on traffic)
  - **Time Window**: 5 minutes
- **Filters**:
  - Environment: `production`
  - Level: `error`
- **Actions**:
  - Send to: `#alerts-critical` (Slack/PagerDuty)
  - Frequency: Every 15 minutes while firing

### 2. Error Rate Percentage Alert (Warning)
**Settings > Alerts > Create Alert > Issues**

- **Name**: `Production - Error Rate Percentage High`
- **Condition**:
  - **Metric**: Error Rate (%)
  - **Threshold**: > 1% (critical), > 0.5% (warning)
  - **Time Window**: 5 minutes
- **Filters**:
  - Environment: `production`
- **Actions**:
  - Send to: `#alerts-warning` (Slack)

### 3. Session Error Rate (Critical for UX)
**Settings > Alerts > Create Alert > Sessions**

- **Name**: `Production - Session Error Rate High`
- **Condition**:
  - **Metric**: Session Error Rate (%)
  - **Threshold**: > 2% (warning), > 5% (critical)
  - **Time Window**: 10 minutes
- **Actions**:
  - Send to: `#alerts-critical`

### 4. Release Health - Crash Free Sessions
**Settings > Alerts > Create Alert > Releases**

- **Name**: `Release - Crash Free Sessions Below Threshold`
- **Condition**:
  - **Metric**: Crash Free Sessions %
  - **Threshold**: < 99.5% (warning), < 99% (critical)
  - **Time Window**: 1 hour
- **Actions**:
  - Send to: `#releases` (Slack)

## Error Budget Calculation

| SLA Target | Monthly Error Budget | Allowed Downtime/Month |
|------------|---------------------|----------------------|
| 99.9%      | 0.1%                | 43.2 minutes         |
| 99.5%      | 0.5%                | 3.6 hours            |
| 99.95%     | 0.05%               | 21.6 minutes         |

## Alert Routing (Sentry Settings > Alerts > Routing)

```yaml
# .sentryclirc or Sentry UI
projects:
  hexa-studio:
    alerts:
      - name: "Critical Errors"
        conditions: 
          - event_frequency > 10/min
        actions:
          - type: slack
            webhook: ${SENTRY_SLACK_CRITICAL_WEBHOOK}
          - type: pagerduty
            service: ${PAGERDUTY_CRITICAL_SERVICE}
      
      - name: "Warning Errors"
        conditions:
          - error_rate > 0.5%
        actions:
          - type: slack
            webhook: ${SENTRY_SLACK_WARNING_WEBHOOK}

      - name: "Release Health"
        conditions:
          - crash_free_sessions < 99.5%
        actions:
          - type: slack
            webhook: ${SENTRY_SLACK_RELEASES_WEBHOOK}
```

## Environment Variables Required

```bash
# Frontend
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/xxx
SENTRY_SLACK_WARNING_WEBHOOK=https://hooks.slack.com/xxx
SENTRY_SLACK_RELEASES_WEBHOOK=https://hooks.slack.com/xxx

# Backend (in .env)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/xxx
```

## Testing Error Budgets

```bash
# Trigger test error
curl -X POST https://sentry.io/api/0/projects/hexa-studio/hexastudio/envelopes/ \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -d '{"event_id": "test-123", "level": "error", "message": "Test error budget alert"}'
```

## Monitoring Dashboard (Grafana)

Add Sentry metrics to Grafana dashboard:
```promql
# Error rate
rate(sentry_events_total{level="error"}[5m])

# Error rate %
sum(rate(sentry_events_total{level="error"}[5m])) / sum(rate(sentry_events_total[5m])) * 100

# Crash free sessions
sentry_release_crash_free_sessions_percent

# Release adoption
sentry_release_adoption_percent
```

## Next Steps
1. Configure alerts in Sentry UI using above thresholds
2. Add Slack webhook URLs to environment
3. Test alerts with `npm run sentry:test`
4. Document runbook for each alert type