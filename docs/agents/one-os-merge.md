# HEXA ONE OS — Hermes + OpenCode Perfect Merge

**Status:** Accepted (ADR-017) · **Risk:** MEDIUM · **Scope:** `hexa-hub` only

One perfect entry over two excellent tools:

- **Hermes = brain/shell** — memory (Honcho + skills), gateway (Telegram/Discord/Slack/WhatsApp/iMessage/Signal/Matrix/Teams/Email), desktop shell (`hermes desktop`), dashboard, proxy, profiles, skins, plugins.
- **OpenCode = hands** — autonomous code runs (`build`/`plan`), sessions, PR review, parallel worktrees via `hexa-hub/src/bridge.ts`.
- **ONE-OS = contract** — deterministic router + canonical session + unified memory + orchestrator.

## Rule

**Hermes decides, OpenCode does, ONE-OS remembers.**

| Prompt | Route | Flow |
|---|---|---|
| memory / skill / gateway / desktop / provider | `hermes` | single Hermes call |
| implement / refactor / fix / tests / review | `opencode` | single `opencode run` (`build` or `plan`) |
| both / ambiguous / full feature | `hybrid` | Hermes drafts plan → OpenCode executes plan → combined result |

## Use

```ts
import { OneOsBridge, resolveOneOsConfig } from '../src/one-os/index.js';
import { McpBridge } from '../src/bridge.js';

const cfg = resolveOneOsConfig(process.env, process.cwd());
const mcp = new McpBridge({ repoPath: cfg.repoPath });

const one = new OneOsBridge({
  hermes: async (prompt, sessionId) => {
    // production: spawn `hermes chat -q <prompt>` (profile-safe via $HERMES_HOME)
    return { output: `plan for: ${prompt}`, sessionId: sessionId ?? 'h-new' };
  },
  opencode: async (agent, prompt, sessionId) => {
    return mcp.executeOpencodeRun(agent, prompt, sessionId);
  },
});

const res = await one.run('remember this repo and implement retry logic with tests');
// res.route === 'hybrid', res.hermesSessionId + res.opencodeSessionId linked via res.oneId
```

## Sessions

Canonical id: `one_<ms>_<base36>` → maps to `hermesSessionId` + `opencodeSessionId`.

```ts
import { createOneId, createSessionRef, linkHermesSession, linkOpencodeSession } from '../src/one-os/index.js';
```

Immutable link helpers; expiry via `isSessionExpired(ref, now)`. TTL default 30 min (`ONE_OS_SESSION_TTL_MS`).

## Memory

```ts
import { renderOneOsMemory } from '../src/one-os/index.js';
const md = renderOneOsMemory({
  hermesWorkspaceId: 'hermes',
  hermesPeerId: 'user',
  hermesRepresentation: '...from Honcho...',
  opencodeProjectName: 'HexaStudio',
  opencodeStack: ['Next.js 16', 'NestJS 11'],
  bridgeSessionCount: 3,
  recentSummaries: ['...'],
});
```

Secret-free (callers pass redacted strings), truncated (4k representation, 10×280ch summaries).

## Desktop story (one perfect window)

- Shell: `hermes desktop` (Electron) — chat, session list, Cmd+K palette, drag-drop, notifications.
- Hands: OpenCode attached as worker (`opencode attach` / `opencode run`), never a second window the user must manage.
- Inspect live shell via CDP (`127.0.0.1:9222` + `apps/desktop/scripts/eval.mjs`) per `inspecting-hermes-desktop-dom` skill. Never relaunch the user's app to probe.

## Config (env-first, profile-safe)

| Var | Default |
|---|---|
| `HERMES_HOME` / `HERMES_PROFILE` | `~/.hermes` / `~/.hermes/profiles/<name>` |
| `OPENCODE_CONFIG` | `~/.config/opencode/opencode.json` |
| `HONCHO_BASE_URL` | `http://19.16.1.100:8000` |
| `HONCHO_API_KEY` | probed only as `hasHonchoKey` boolean, never returned |
| `REPO_PATH` | `process.cwd()` |
| `ONE_OS_SESSION_TTL_MS` | `1800000` |

## Verification

```bash
cd hexa-hub
npm run lint
npx tsc --noEmit
npm test
```

Expected: lint 0/0, typecheck 0 errors, all suites green (20 session + 5 ONE-OS files).

## Rollback

Delete `hexa-hub/src/one-os/` + `hexa-hub/tests/one-os/`, revert `hexa-hub/src/index.ts`, remove ADR-017 index line. `McpBridge` works standalone.
