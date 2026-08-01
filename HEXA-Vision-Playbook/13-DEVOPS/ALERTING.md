# 🚨 ALERTING PIPELINE — PROMETHEUS + LOKI RULER → ALERTMANAGER

**Version:** 1.0.0 | **Scope:** Production Alerting | **Status:** Live (2026-08-01)

---

## 1. OVERVIEW

```
 Prometheus (PromQL rules) ─┐
                            ├──► Alertmanager (:9093) ──► webhook service (:9000) ──► Telegram/Discord (optional)
 Loki Ruler (LogQL rules) ──┘
```

Two independent rule engines evaluate continuously; both fan out to the same
Alertmanager, which groups, dedupes, and routes notifications.

| Engine | Rule format | Files | Evaluated |
|--------|------------|-------|-----------|
| Prometheus | PromQL | `docker/prometheus/rules/alerts.yml` (17 rules) | every 15s |
| Loki Ruler | LogQL | `docker/loki/rules/fake/loki-alerts.yml` (10 rules) | every 30s |

---

## 2. COMPONENTS

### 2.1 Prometheus rules (`docker/prometheus/rules/`)
- Mounted into the Prometheus container at `/etc/prometheus/rules` (read-only).
- Referenced from `docker/prometheus/prometheus.yml` → `rule_files: ["rules/*.yml"]`.
- **Do not place LogQL files here** — the PromQL parser will reject them and
  Prometheus will fail to start (this happened with `loki-alerts.yml` in July 2026).

### 2.2 Loki Ruler (`docker/loki/rules/fake/`)
- **Tenant layout is mandatory**: Loki's local ruler storage only loads rules
  from `<rule_path>/<tenant>/<file.yml>`. With `auth_enabled: false` the tenant
  is `fake`, hence `docker/loki/rules/fake/loki-alerts.yml`.
- Mounted into the Loki container at `/loki/rules` (read-only).
- `ruler.alertmanager_url: http://alertmanager:9093` in `loki-config.yml`.
- Verify loaded rules: `GET http://loki:3100/api/prom/rules`.

### 2.3 Alertmanager (`prom/alertmanager:v0.27.0`)
- Config: `docker/alertmanager/alertmanager.yml` → `/etc/alertmanager/alertmanager.yml`.
- Routes group by `alertname` + `severity`; `critical` repeats every 1h, `warning` 4h.
- Single receiver `webhook` → `http://webhook:9000/alert`.
- UI: https://alertmanager.hexastudio.net (Traefik + Cloudflare tunnel, basic auth).
- Tunnel ingress includes `alertmanager.hexastudio.net` → `http://traefik:80` (added 2026-08-01 via CF API; Traefik router applies `traefik-auth`). If the UI returns 404, the hostname is missing from the tunnel's remote config (`docker logs hexastudio-cloudflared-1` shows the ingress list) — re-add via CF dashboard/API.

### 2.4 Webhook receiver (`webhook` service)
- Tiny Node.js service, `docker/webhook/`, listening on `:9000`.
- Logs every alert; forwards to **Telegram** if `TELEGRAM_BOT_TOKEN` +
  `TELEGRAM_CHAT_ID` are set, or **Discord** if `DISCORD_WEBHOOK_URL` is set.
- Add credentials to the server `.env` and `docker compose up -d webhook`.

---

## 3. OPERATIONS

### Adding a PromQL rule
1. Edit `docker/prometheus/rules/alerts.yml` (valid PromQL, `groups:` → `rules:`).
2. Validate: `docker exec hexastudio-prometheus-1 promtool check rules /etc/prometheus/rules/alerts.yml`
3. Reload: `docker compose -f docker-compose.prod.yml up -d prometheus` (or POST `/-/reload`).

### Adding a LogQL rule
1. Edit `docker/loki/rules/fake/loki-alerts.yml` (valid LogQL).
2. Reload: `docker compose -f docker-compose.prod.yml up -d loki`.

### Checking state
```bash
docker exec hexastudio-grafana-1 wget -qO- http://alertmanager:9093/api/v2/alerts   # firing alerts
docker exec hexastudio-grafana-1 wget -qO- http://prometheus:9090/api/v1/rules     # PromQL rules
docker exec hexastudio-grafana-1 wget -qO- http://loki:3100/api/prom/rules         # LogQL rules
```

### Known pitfalls
- **Scraping raw service ports** (e.g. `redis:6379`) produces `up=0` false
  positives — always scrape through an exporter (`redis-exporter:9121`).
- **Unsupported Alertmanager config fields** (e.g. `disable_keep_alives` in
  v0.27.0) cause a crash-loop: check `docker logs hexastudio-alertmanager-1`.
- **Stale compose copies** — always run compose from `/home/hexa/hexastudio`
  with the real `.env`. A stale `/root` copy once recreated the stack with
  placeholder env (`TUNNEL_TOKEN=dummy`) and took the site down. See
  `TROUBLESHOOTING.md` → "Stack recreated with placeholder env".
