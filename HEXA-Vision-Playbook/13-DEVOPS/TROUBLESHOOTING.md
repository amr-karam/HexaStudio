# Troubleshooting Guide: Local Staging

## Common Issues & Solutions

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
**Symptom:** `deploy-local.sh` fails with `Permission denied`.
**Fix:** Ensure scripts are executable:
```bash
chmod +x deploy-local.sh healthcheck.sh
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
