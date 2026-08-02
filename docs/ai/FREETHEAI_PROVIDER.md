# FreeTheAi Provider — Setup, Model Catalog & Integration Guide

**Version:** 1.0.0
**Last Updated:** 2026-07-19
**Scope:** OpenCode configuration, model selection, HEXA Studio agent workflow
**Related:** [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) · [AI_AGENT_GUIDE.md](../04-AGENTS/AI_AGENT_GUIDE.md)

---

## 1. Overview

FreeTheAi is a free OpenAI-compatible API gateway exposing 40+ chat models from multiple upstream providers (DeepSeek, GLM/Zhipu, NVIDIA Nemotron, MiniMax, Gemini, Grok, Kimi, and others) behind a single endpoint and API key.

| Property | Value |
|---|---|
| Base URL | `https://api.freetheai.xyz/v1` |
| Auth | `Authorization: Bearer <key>` |
| Protocol | OpenAI-compatible (`/chat/completions`, `/models`) |
| Cost | Free (all requests return `"cost": "0"`) |
| Key location | `~/.config/opencode/opencode.json` → `provider.freetheai.options.apiKey` |

> ⚠️ **Security:** The API key lives in the global OpenCode config only. Never commit it to the monorepo, never paste it into docs, prompts, or client code. See `06-STANDARDS/SECURITY_STANDARDS.md`.

---

## 2. Setup Guide (OpenCode)

### 2.1 Configuration

FreeTheAi is registered as a custom provider in the **global** config `C:\Users\amrmo\.config\opencode\opencode.json` (global, not project-level, so it is available in every repo):

```jsonc
{
  "provider": {
    "freetheai": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "FreeTheAi",
      "options": {
        "baseURL": "https://api.freetheai.xyz/v1",
        "apiKey": "sta_***" // real key in the local config only
      },
      "models": {
        "opc/deepseek-v4-flash-free": {
          "name": "DeepSeek V4 Flash",
          "limit": { "context": 200000, "output": 128000 }
        }
        // ... 41 models total, see catalog below
      }
    }
  }
}
```

### 2.2 Using a model

Inside the OpenCode TUI:

```
/model freetheai/opc/deepseek-v4-flash-free
/model freetheai/glm/glm-5.2
/model freetheai/kai/nvidia/nemotron-3-super-120b-a12b:free
```

Model reference format: `freetheai/<model-id>` — the model ID includes the upstream prefix (`opc/`, `glm/`, `kai/`, `bbl/`, `mim/`, `min/`, `olm/`).

Assigning a model to an agent in `opencode.json`:

```jsonc
"agent": {
  "build": { "model": "freetheai/olm/deepseek-v4-pro" }
}
```

### 2.3 Verifying connectivity

```powershell
# List models
curl -s "https://api.freetheai.xyz/v1/models" -H "Authorization: Bearer $env:FREETHEAI_KEY"

# Smoke-test a completion (reasoning models need a generous max_tokens)
curl -s "https://api.freetheai.xyz/v1/chat/completions" `
  -H "Authorization: Bearer $env:FREETHEAI_KEY" -H "Content-Type: application/json" `
  -d '{"model":"opc/deepseek-v4-flash-free","messages":[{"role":"user","content":"ping"}],"max_tokens":2000}'
```

Verified working on 2026-07-19: `opc/deepseek-v4-flash-free` and `opc/big-pickle` both return correct completions.

### 2.4 Known behavior

- **Reasoning-heavy models:** Many models (`opc/*`, Nemotron reasoning variants) emit `reasoning_content` before `content`. A simple greeting consumed ~1,500 completion tokens. **Never set low `max_tokens`** — with a small budget the reasoning eats it all, `content` comes back empty, and `finish_reason` is `length`. OpenCode's configured output limits handle this automatically.
- **Throughput:** This is a free gateway — expect variable latency and possible rate limits. Use it for drafting, exploration, and bulk work; keep paid models for latency-sensitive or mission-critical passes.

---

## 2.5 Backend Integration (NestJS)

FreeTheAi is wired into the NestJS backend as a **provider-agnostic chat client** that all assistant and AI services consume via dependency injection. This replaces every direct `new OpenAI()` call.

### Architecture

```
[Assistant Services] ──► AiChatService (ai/ai-chat.service.ts)
                              │
                          createChatClient() (ai/llm.factory.ts)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              openai/*              freetheai/*
           (paid, default)       (free gateway)
```

### Setting provider

`AI_CHAT_PROVIDER` env var (defined in `config/env.ts`):

| Value | Effect | Key required |
|---|---|---|
| `openai` (default) | Uses `OPENAI_API_KEY` and `OPENAI_MODEL` | `OPENAI_API_KEY` |
| `freetheai` | Uses `FREETHEAI_API_KEY` and `FREETHEAI_MODEL` | `FREETHEAI_API_KEY` |

**File checklist** (7 files total):

| Layer | Files |
|---|---|
| Schema | `config/env.ts` — 4 new fields: `FREETHEAI_API_KEY`, `FREETHEAI_BASE_URL`, `FREETHEAI_MODEL`, `AI_CHAT_PROVIDER` |
| Factory | `modules/ai/llm.factory.ts` — standalone `createChatClient()` function |
| DI service | `modules/ai/ai-chat.service.ts` — `@Injectable()` wrapper with `client`, `model`, `provider`, `isAvailable` |
| Module | `modules/ai/ai.module.ts` — `AiChatService` added to `providers` and `exports` |
| Migrated chat consumers | `modules/ai/auto-tag.service.ts` |
| | `modules/ai/summary.service.ts` |
| | `modules/assistants/services/*.ts` (6 services: CEO, Sales, PM, Lighting, Material, Predictive) |

### What is NOT changed

- **EmbeddingService** (`modules/ai/embedding.service.ts`) — still uses `OPENAI_API_KEY` directly because the FreeTheAi gateway lacks an `/embeddings` endpoint. Embeddings always route to the paid OpenAI backend.
- **GeminiService** (`modules/ai/gemini.service.ts`) — the existing Google Gemini integration remains independent (controlled by `GEMINI_API_KEY` / `GEMINI_MODEL`). It is a separate provider for the R3F assistant.

### Switching providers at runtime

No restart required to flip between cached keys, but changing `AI_CHAT_PROVIDER` or any key requires a container restart since env vars are read at module init.

```
# .env — switch to FreeTheAi for non-sensitive work
AI_CHAT_PROVIDER=freetheai
FREETHEAI_API_KEY=sta_...
FREETHEAI_MODEL=bbl/gemini-3.5-flash

# .env — switch back to OpenAI for production PII flows
AI_CHAT_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

---

## 3. Model Catalog Reference (41 models)

### 3.1 Coding & engineering (primary picks)

| Model ID | Context | Output | Use case |
|---|---|---|---|
| `olm/deepseek-v4-pro` | 200k | 64k | Strongest DeepSeek tier — complex implementation, refactoring |
| `opc/deepseek-v4-flash-free` | 200k | 128k | **Default coder** — fast, huge output for large diffs |
| `olm/kimi-k2.7-code` | 200k | 64k | Code-specialized Kimi — agentic coding loops |
| `kai/kwaipilot/kat-coder-pro-v2.5:free` | 256k | 80k | Code generation, test writing |
| `opc/north-mini-code-free` | 256k | 64k | Light coding tasks, quick edits |
| `kai/cohere/north-mini-code:free` | 256k | 64k | Same family, alternate route |

### 3.2 Large-context / architecture review

| Model ID | Context | Output | Use case |
|---|---|---|---|
| `glm/glm-5.2` | **1M** | 131k | Whole-monorepo analysis, cross-cutting refactors |
| `kai/nvidia/nemotron-3-super-120b-a12b:free` | 1M | **262k** | Biggest output budget — mass codegen, long reports |
| `kai/nvidia/nemotron-3-ultra-550b-a55b:free` | 1M | 65k | 550B flagship — hardest reasoning problems |
| `opc/nemotron-3-ultra-free` | 1M | 128k | Same flagship via opc route, larger output |
| `mim/mimo-v2.5-pro` | 1M | 131k | Long-context multimodal-lineage model |
| `mim/mimo-v2-pro` / `mim/mimo-v2.5` | 1M | 131k | Alternates of the above |
| `min/minimax-m3` | 1M | 32k | Long-document QA, summarization |
| `kai/openrouter/auto-beta` | 2M | 32k | Auto-routed — largest context window available |

### 3.3 General purpose / GLM family

| Model ID | Context | Output | Use case |
|---|---|---|---|
| `glm/glm-5.1` | 200k | 131k | Current-gen generalist |
| `glm/glm-5` / `glm/glm-5-turbo` | 200k | 131k | Generalist / faster variant |
| `glm/glm-4.7` / `glm/glm-4.6` | 200k | 131k | Previous gen, stable |
| `glm/glm-4.5` / `glm/glm-4.5-air` | 128k | 98k | Older gen; Air = lightweight |
| `olm/deepseek-v3.1` | 200k | 64k | Older DeepSeek, still capable |
| `opc/big-pickle` | 200k | 32k | Anonymized frontier reasoning model |
| `opc/mimo-v2.5-free` | 200k | 32k | Free MIMO route |
| `opc/hy3-free` / `kai/tencent/hy3:free` | 190–262k | 64–262k | Tencent Hunyuan 3 |

### 3.4 Fast & lightweight (drafts, classification, commit messages)

| Model ID | Context | Output | Use case |
|---|---|---|---|
| `bbl/gemini-3.5-flash` | 80k | 32k | Best of the fast tier |
| `bbl/gemini-3.1-flash-lite` / `bbl/gemini-3.0-flash` / `bbl/gemini-2.5-flash-lite` | 80k | 32k | Cheap quick calls |
| `bbl/gpt-5.5-mini` | 80k | 32k | OpenAI-flavored small model |
| `bbl/grok-4.1-fast-non-reasoning` | 80k | 32k | No reasoning overhead — instant answers |
| `kai/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 256k | 65k | Small but reasoning-capable |
| `kai/poolside/laguna-m.1:free` / `kai/poolside/laguna-xs-2.1:free` | 262k | 32k | Poolside code-lineage small models |
| `kai/stepfun/step-3.7-flash:free` | 262k | 262k | Fast with huge output ceiling |
| `kai/kilo-auto/free` / `kai/openrouter/free` | 200–256k | 10–32k | Auto-routed fallbacks |
| `mim/mimo-v2-omni` | 262k | 32k | Omni-modal small model |

### 3.5 Special purpose

| Model ID | Use case |
|---|---|
| `kai/nvidia/nemotron-3.5-content-safety:free` | Content moderation / safety classification only — not a general chat model |

> Audio models (`sun/chirp-*`, `mim/*-tts*`, `mim/*-asr`) exist on the gateway but are excluded from the OpenCode config — not usable in a coding TUI.

---

## 4. HEXA Studio Integration Guide

### 4.1 Where FreeTheAi sits

Per [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md), HEXA uses a hybrid AI approach. FreeTheAi is the **zero-cost chat tier**:

```
[OpenCode Agents]              [NestJS Assistants]
    │                                  │
    ├── Paid (openai/*)               ├── paid (AI_CHAT_PROVIDER=openai)
    └── Free (freetheai/*)  ──────────└── free (AI_CHAT_PROVIDER=freetheai)
                                          │
                                      AiChatService
                                          │
                                    createChatClient()
```

Both layers — OpenCode agents and NestJS backend assistants — share the same FreeTheAi gateway. The backend switches with `AI_CHAT_PROVIDER` in `.env`, while OpenCode switches via `/model freetheai/<id>`.

### 4.2 Recommended agent → model mapping

The current agent roster (`build`, `plan`, `orchestrator`, `review` + subagents) can offload to FreeTheAi as follows:

| Agent | Recommended model | Rationale |
|---|---|---|
| `build` | `freetheai/olm/deepseek-v4-pro` | Strong coder, 64k output for big diffs |
| `plan` | `freetheai/glm/glm-5.2` | 1M context — reads the whole playbook + sprint docs |
| `orchestrator` | `freetheai/opc/nemotron-3-ultra-free` | Flagship reasoning for task decomposition |
| `review` | `freetheai/opc/big-pickle` | Deep reasoning finds subtle defects |
| `explore` / `scout` subagents | `freetheai/bbl/gemini-3.5-flash` | Fast, cheap sweeps |
| `docs` | `freetheai/kai/nvidia/nemotron-3-super-120b-a12b:free` | 262k output for long documents |
| `qa` | `freetheai/opc/deepseek-v4-flash-free` | Test generation with large output |

To apply, change the `model` field per agent in `opencode.json`. The `openai/*` assignments remain valid as the paid fallback — switching back is a one-line edit.

### 4.3 Monorepo workflow patterns

**Pattern A — Free-first, paid-final (recommended):**
1. Draft with `freetheai/opc/deepseek-v4-flash-free` (features, tests, docs).
2. Run the quality gate (`/qa-all`: lint, typecheck, tests) — per `15-QUALITY/QUALITY_GATES.md` the gate is model-agnostic: code either passes or it doesn't.
3. Optional final review pass on a paid model for anything touching auth, payments, or infra.

**Pattern B — Whole-repo analysis:**
Use 1M-context models (`glm/glm-5.2`, `opc/nemotron-3-ultra-free`) for tasks that must see across `apps/frontend`, `apps/backend`, `apps/cms`, and `packages/*` simultaneously: dependency audits, cross-cutting refactors, ADR impact analysis.

**Pattern C — Parallel subagent fan-out:**
Fan out `explore`/`general` subagents on fast free models to scan the monorepo in parallel, then synthesize with a flagship model. Zero API cost makes wide fan-out affordable.

### 4.4 Rules of engagement (HEXA Gold Standard)

- **Quality gates are unchanged.** Free-tier output goes through the same `!verify` pipeline (lint, typecheck, tests, Lighthouse) as any other code. Origin model is irrelevant to the gate.
- **No secrets to the gateway.** FreeTheAi is a third-party service. Never send `.env` contents, JWT secrets, database credentials, or client PII in prompts. Redact before pasting logs. For the NestJS backend, the `AI_CHAT_PROVIDER=freetheai` setting should **only** be used in development/staging environments; production Odoo assistant flows that process CRM leads, client emails, and financial data must keep `AI_CHAT_PROVIDER=openai`.
- **Creative Excellence Mode still applies** to frontend work regardless of which model produced the draft (9.5/10 luxury bar).
- **Availability caveat:** a free gateway has no SLA. If FreeTheAi is down or rate-limited mid-sprint, switch the provider back to `openai` and continue — do not block the sprint on a free service.

### 4.5 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Empty `content`, `finish_reason: length` | Reasoning tokens ate the budget | Raise `max_tokens` / rely on configured output limits |
| `401 Unauthorized` | Key revoked or malformed header | Re-check `apiKey` in global config |
| Model not in `/model` picker | Model ID typo or missing from `models` map | IDs are exact, prefix included (`opc/`, `glm/`, …); re-fetch `/v1/models` to confirm the catalog |
| Slow responses | Free-tier congestion | Switch to `bbl/*` fast tier or paid provider |
| New models appear on gateway | Catalog changed upstream | Re-fetch `/v1/models`, add entries to config |
| Backend assistant returns `401` | `FREETHEAI_API_KEY` not set or wrong in `.env` | Add `FREETHEAI_API_KEY` and set `AI_CHAT_PROVIDER=freetheai` in `.env` |

---

## 5. Maintenance

- **Catalog refresh:** the gateway adds/removes models without notice. Re-run the `/v1/models` check monthly (or when a model errors) and sync the config.
- **Key rotation:** if the key leaks or dies, replace it in `~/.config/opencode/opencode.json` (OpenCode) and/or `apps/backend/.env` (NestJS). No key is committed to the monorepo.
- **.env.example sync:** when adding or removing FreeTheAi env vars, mirror the change in `apps/backend/.env.example` so new clones don't miss them.
- **Doc ownership:** Documentation Lead. Update this file and `CHANGELOG.md` on any provider/config change, per `AGENTS.md` rules.
