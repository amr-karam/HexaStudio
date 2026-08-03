# Troubleshooting Guide: Local Staging

## Common Issues & Solutions

### 0. Uptime probes time out (15s) / slow page loads from Egypt — Cloudflare edge IP `188.114.96.6` unreachable
**Symptom:** Prometheus `probe_success` = 0 for `hexastudio.net` (exactly 15.0s duration), but global check-host.net shows 200 OK from 8+ locations in <1s. From Egyptian networks, some requests take 10-15s or time out.
**Root cause (verified 2026-08-01):** Cloudflare anycast edge IP `188.114.96.6` (returned by DNS alongside `188.114.97.6`) drops SYN packets from Egyptian networks (server egress `197.52.11.56` and local ISP). TCP connect retries with exponential backoff (~7s/15s/31s), exceeding probe timeout. The IP responds fine globally (10/10 check-host nodes <0.1s) and neighboring IPs (`188.114.96.7`, `188.114.97.6`, `188.114.97.3`, `172.67.x`, `104.21.x`) all respond instantly from Egypt — only `188.114.96.6` is affected. This matches the well-documented ISP-blocking of Cloudflare `188.114.96.0/24` + `188.114.97.0/24` ranges (CF community reports from Egypt/Lebanon — e.g., Liban Telecom transit issue).
**Confirm:**
```bash
# Fast if the edge is healthy, 15s+ timeout if hitting the dead IP:
curl -4 -s -o /dev/null -w "connect:%{time_connect} total:%{time_total}\n" --max-time 20 https://hexastudio.net
# Force the healthy edge IP to confirm origin is fine:
curl --resolve hexastudio.net:443:188.114.97.6 -s -o /dev/null -w "%{http_code} %{time_total}s\n" --max-time 20 https://hexastudio.net
```
**Fix:** Nothing to fix on our side — infrastructure is healthy. Wait for the ISP/Cloudflare routing to recover, or contact the ISP about the blocked range. Do NOT panic-redeploy; check global health first via https://check-host.net/check-http?host=https://hexastudio.net.

### 1. Containers fail to start
**Symptom:** `docker compose up` shows errors for `backend` or `cms`.
**Fix:** Check the health of the database.
```bash
docker compose logs postgres
```
Ensure the `.env` variables match exactly in `docker-compose.yml`.

### 2. 3D Canvas is blank
**Symptom:** Frontend loads, but the 3D scene doesn't appear.
**Fix:** 
- Check browser console for `CORS` errors.
- Ensure the `NEXT_PUBLIC_API_URL` in `.env` is correct.
- Check if the backend is returning the model URL correctly.

### 3. "502 Bad Gateway"
**Symptom:** Accessing `http://localhost` returns a 502.
**Fix:** The `nginx` proxy cannot reach the `frontend` container.
- Verify the frontend is healthy: `docker ps`
- Check nginx logs: `docker compose logs nginx`

### 4. Permissions Issues
**Symptom:** `ops/scripts/deploy-local.sh` fails with `Permission denied`.
**Fix:** Ensure scripts are executable:
```bash
chmod +x ops/scripts/deploy-local.sh ops/scripts/healthcheck.sh
```

### 5. Memory Exhaustion
**Symptom:** Server becomes unresponsive during `docker compose build`.
**Fix:** Increase swap space on Ubuntu or allocate more RAM to the VM.
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```
