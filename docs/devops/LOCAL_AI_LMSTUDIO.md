# Local AI — LM Studio (Free & Unlimited)

> **Status:** LIVE (deployed `1266eab0`, 2026-08-01; 12B upgrade 2026-08-01)
> **Cost:** $0 — no API keys, no quotas, no rate limits. Data never leaves the server.

## Overview

The server runs a self-hosted, OpenAI-compatible LLM endpoint via **LM Studio** (`llmster`).
All chat/vision/agent AI in the deployed backend uses it as the default provider.

- Endpoint: `http://host.docker.internal:1234/v1` (from containers) / `127.0.0.1:1234` (host)
- **Primary model: `gemma-4-12b-it-qat`** (12B, multimodal — vision-capable, verified; copied
  from the dev workstation, MD5 `a676f49c…` on both sides). Env: `LM_STUDIO_MODEL` in server `.env`.
- Secondary models: `google/gemma-4-e4b` (7.5B fallback), `nvidia/nemotron-3-nano-4b`,
  `text-embedding-nomic-embed-text-v1.5`
- Bind: `0.0.0.0:1234`, **firewalled to Docker subnets (172.16.0.0/12) + localhost only**
- Storage: `~/.lmstudio/` (~16.4 GB models, 1.8 TB free disk)

## Systemd Units (server)

| Unit | Purpose |
|---|---|
| `lms-ai.service` | Starts LM Studio server on boot (`lms server start --bind 0.0.0.0`) |
| `lms-ai-firewall.service` | iptables: allow 1234 from 172.16.0.0/12 + 127.0.0.0/8; DROP everything else |

Both enabled (`multi-user.target`). Verify:

```bash
systemctl status lms-ai lms-ai-firewall
iptables -L INPUT -n | grep 1234
curl -s http://127.0.0.1:1234/v1/models
```

## Code Wiring (hexa-platform)

`AI_CHAT_PROVIDER` (`apps/backend/src/config/env.ts`): `'local' | 'freetheai' | 'openai'`, **default `local`**.

| Env var | Default |
|---|---|
| `LM_STUDIO_BASE_URL` | `http://host.docker.internal:1234/v1` |
| `LM_STUDIO_MODEL` | `google/gemma-4-e4b` |

- `llm.factory.ts` → `createChatClient()` resolves `local` first (no key needed)
- `ai-chat.service.ts` → powers CEO/Sales/PM assistants, portal copilot, summaries, auto-tag
- `agents.service.ts` → AgentStudio tool-calling agents (local model supports function calls)
- `multimodal.service.ts` → vision analysis (style, materials, 3D scenes, BIM, briefs) via `generateVision()` helper; JSON output via `response_format`

`docker-compose.prod.yml` + `docker-compose.green.yml` (backend service):
```yaml
AI_CHAT_PROVIDER: ${AI_CHAT_PROVIDER:-local}
LM_STUDIO_BASE_URL: ${LM_STUDIO_BASE_URL:-http://host.docker.internal:1234/v1}
LM_STUDIO_MODEL: ${LM_STUDIO_MODEL:-google/gemma-4-e4b}
extra_hosts:
  - "host.docker.internal:host-gateway"
```

## Verification (live)

```bash
docker logs hexa-backend-blue | grep "Chat LLM"
# → Chat LLM → local (model: google/gemma-4-e4b)

# End-to-end from inside the backend container:
docker exec hexa-backend-blue node -e "
const O=require('/app/node_modules/openai');
const c=new O({apiKey:'lm-studio',baseURL:'http://host.docker.internal:1234/v1'});
c.chat.completions.create({model:'google/gemma-4-e4b',messages:[{role:'user',content:'Hello in 3 words'}],max_tokens:800}).then(r=>console.log(r.choices[0].message.content));
"
```

## Known Behaviors

- **gemma-4 models are reasoning models**: first ~150-370 tokens are internal reasoning
  (12B reasons longer than E4B). `max_tokens` must be ≥ 300 for visible output;
  production services use 800+, verified with both models.
- 12B is slower on CPU than E4B (~20-40 s first response incl. reasoning). Switch back with
  `LM_STUDIO_MODEL=google/gemma-4-e4b` in server `.env` + backend recreate if latency matters.
- Vision: verified working with base64 `data:` URLs (multimodal, 1-2 images per call).
- Audio transcription (`voice.service.ts`) stays disabled locally — gemma-4 has no audio input.
  Set `GEMINI_API_KEY` if voice is needed (falls back gracefully).
- Embeddings: `embedding.service.ts` still needs `OPENAI_API_KEY` (or uses placeholder vectors).
  LM Studio's nomic model is 768-dim vs the 1536-dim Qdrant collections — not swapped to avoid
  breaking semantic search.
- Model stays loaded after first request (auto-load). First call after boot is slower (~10-30 s).
- Model files (dev workstation → server, resumable): `sftp` with `put -a` (append) resumes
  interrupted transfers; verify with `md5sum`.

## Fallback Strategy

No keys are required anywhere in the local path. If the LM Studio service is down:

- Chat/agent callers catch errors → deterministic fallback responses (no crash)
- Vision throws → controllers return 5xx (frontend shows error)
- `lms-ai.service` has no `Restart=` (oneshot) — on boot, `RemainAfterExit` + daemonize means
  the server is started by systemd; if it dies at runtime, restart manually:
  `systemctl restart lms-ai`

## hexa-hub (dev, not deployed)

`hexa-hub/apps/api/src/modules/ai/services/ai.service.ts` was rewritten to use LM Studio via
native `fetch` (no new deps — the old `@google/generative-ai` import was never installed).
New `POST /ai/chat` endpoint added to `ai.controller.ts` (JWT-guarded).
Dashboard AI assistant (`hexa-hub/apps/web/.../ai-assistant/page.tsx`) now calls the real API
instead of a 1.5 s fake delay. Files remain in the working tree (user WIP) — not committed.

## Maintenance

- Download new models: `ssh root@19.16.1.100` → `export PATH=$PATH:$HOME/.lmstudio/bin` → `lms get <model-id>`
- Load/swap model: `lms load <path> --identifier <name>` or edit `LM_STUDIO_MODEL` env
- Logs: `journalctl -u lms-ai -f`
- Firewall edit: `/usr/local/bin/lms-ai-firewall.sh` (start/stop), then `systemctl restart lms-ai-firewall`
