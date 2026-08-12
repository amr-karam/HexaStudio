# SPEC — Channel Message Reactions

**Feature:** Emoji reactions on channel messages  
**Status:** Proposed  
**Risk Level:** MEDIUM→HIGH (DB migration + new realtime bridge)  
**Authority path:** `GOVERNANCE.md` → `ARCHITECTURE.md` → new ADR-012 → this SPEC  
**Affects:** `apps/api`, `apps/realtime`, `apps/web`, `packages/types`

---

## 0. Architectural Findings (must read before implementation)

Two issues in the current codebase directly shape this design:

1. **No API → Realtime bridge exists.** The NestJS API (`apps/api`) is the persistence source of truth (Postgres via TypeORM) but currently does **not** broadcast events to the standalone realtime server (`apps/realtime`). Today, channel messages are not delivered in real time at all — `messages/page.tsx` `sendMsg()` does `axios.post(...)` then re-fetches the whole list. Reactions are the right moment to establish the missing **Redis pub/sub event bus**, because reactions are meaningless without live multi-client sync.

2. **Two divergent realtime systems coexist** (pre-existing tech debt):
   - `apps/realtime/` — standalone Socket.IO server (port 3001), events `channel:join`, `channel:message:received`, room prefix `chan:`. **This is what `SocketProvider.tsx` connects to.**
   - `apps/api/src/modules/realtime/realtime.gateway.ts` — a second Socket.IO gateway inside the API, events `join:channel`, `message:created`, room prefix `channel:`. **Nothing on the frontend connects to it.**

   This SPEC targets the **standalone `apps/realtime` server** (the live one) and does **not** extend the dead in-API gateway. A cleanup task for the in-API gateway is noted as follow-up debt but is out of scope.

> ⚠️ **Decision required from you during implementation:** the recommended path builds the Redis pub/sub bridge. If you'd rather defer that, there's a documented fallback (client-emit) in the ADR — but it perpetuates the dual-source-of-truth anti-pattern and is not recommended.

---

## 1. API Contract

Base URL: `${NEXT_PUBLIC_API_URL}` (NestJS, e.g. `http://localhost:3000/api`)  
All endpoints under `@UseGuards(JwtAuthGuard)`. Requesting user derived from `req.user.id`.

### 1.1 Data shapes

```typescript
// packages/types/src/reactions.ts (NEW)
export interface ReactionSummary {
  emoji: string;        // unicode glyph, e.g. "👍" — canonical key
  count: number;        // number of distinct users
  userIds: string[];    // who reacted (for "reacted by..." tooltip)
  reacted: boolean;     // did the current user react? (computed server-side)
}

// Augment ChannelMessage payload (embedded for efficiency)
export interface ChannelMessageWithReactions {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  replyTo?: string;
  sender: { id: string; fullName: string };
  createdAt: string;
  reactions: ReactionSummary[];   // NEW — empty array if none
}

// Socket event payload (server → client)
export interface ChannelReactionUpdatedEvent {
  channelId: string;
  messageId: string;
  reactions: ReactionSummary[];   // full replacement state for the message
  actorId: string;                // who triggered the change
  action: 'added' | 'removed';
  emoji: string;
  timestamp: string;
}
```

### 1.2 Endpoints

| Method | Path | Body | Response | Purpose |
|--------|------|------|----------|---------|
| `POST` | `/channels/:channelId/messages/:messageId/reactions/toggle` | `{ emoji: string }` | `200 ReactionSummary[]` | **Toggle** the current user's reaction. Idempotent. Adds if absent, removes if present. Returns the new full reaction set for that message. |
| `GET` | `/channels/:channelId/messages/:messageId/reactions` | — | `200 ReactionSummary[]` | Fetch reactions for a single message (used for refetch on error). |
| `GET` | `/channels/:channelId/messages` | — | `200 ChannelMessageWithReactions[]` | **Modified** — now embeds `reactions[]` per message. |

#### `POST .../reactions/toggle`

```http
POST /api/channels/:channelId/messages/:messageId/reactions/toggle
Authorization: Bearer <jwt>
Content-Type: application/json

{ "emoji": "👍" }
```

```jsonc
// 200 OK
[
  { "emoji": "👍", "count": 2, "userIds": ["u1","u2"], "reacted": true },
  { "emoji": "🔥", "count": 1, "userIds": ["u3"], "reacted": false }
]
```

**Validation (`ToggleReactionDto`):**
- `emoji`: `@IsString()`, `@IsNotEmpty()`, `@MaxLength(32)` — accepts a single grapheme cluster. Rejects empty / oversize. Server does **not** validate against a fixed emoji whitelist (too brittle; Unicode evolves); it stores raw and the client renders.

**Authorization checks (server-side, non-negotiable per SECURITY.md):**
- `channelId` must exist.
- Requesting user must be a `ChannelMember` of `channelId` (RBAC — prevents reacting from outside the channel).
- `messageId` must belong to `channelId` (path consistency).
- Message `type` must not be `'system'` (system messages are not reactable — see §4).

**Error contract** (reuse NestJS exception filter):
- `403` — user is not a member of the channel.
- `404` — channel or message not found.
- `400` — invalid emoji payload.

### 1.3 Why toggle (not add/remove pair)?

A single toggle endpoint matches the UX exactly (one click = flip state), is idempotent (safe to retry on flaky networks), and avoids the awkwardness of an emoji in a `DELETE` path/query. The REST-pure `POST`/`DELETE` pair is documented in the ADR as the rejected alternative.

---

## 2. Database Schema

New table `channel_message_reactions`. Reversible migration (per GOVERNANCE §47).

```sql
CREATE TABLE channel_message_reactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES channel_messages(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji        VARCHAR(32) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_reaction_per_user UNIQUE (message_id, user_id, emoji)
);
CREATE INDEX idx_reactions_message ON channel_message_reactions (message_id);
CREATE INDEX idx_reactions_user    ON channel_message_reactions (user_id);
```

- **UNIQUE (message_id, user_id, emoji)** — DB-enforced integrity (GOVERNANCE §10). One user cannot react twice with the same emoji; toggle is implemented as `INSERT ... ON CONFLICT DO NOTHING` for add and `DELETE` for remove.
- **CASCADE** on `message_id` — reactions die with the message.
- **CASCADE** on `user_id` — reactions die with the user (GDPR-friendly, per §24).

### TypeORM entity (new)

`apps/api/src/modules/channels/entities/channel-message-reaction.entity.ts` — mirrors the `channel-member.entity.ts` pattern (`@Unique(...)` decorator, `@ManyToOne` to `ChannelMessage` and `User`).

```typescript
@Entity('channel_message_reactions')
@Unique(['message', 'user', 'emoji'])
export class ChannelMessageReaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => ChannelMessage, { onDelete: 'CASCADE' }) message: ChannelMessage;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @Column({ length: 32 }) emoji: string;
  @CreateDateColumn() createdAt: Date;
}
```

Add a `@OneToMany(() => ChannelMessageReaction, r => r.message) reactions: ChannelMessageReaction[];` to `ChannelMessage` so `getMessages` can eagerly load and aggregate them.

---

## 3. Component Tree (Frontend)

```
messages/page.tsx  (MODIFY)
├── MessageBubble  (MODIFY — render reactions + hover affordance)
│   ├── ReactionBar        (NEW — pills of existing reactions, click to toggle)
│   │   └── ReactionPill   (NEW — single emoji + count, highlighted if user reacted)
│   └── ReactionPicker     (NEW — quick-react row + "more" → lazy emoji-mart)
│       └── <EmojiMart>     (NEW — dynamic import, code-split)
└── (socket listener wiring for 'channel:reaction:updated')
```

### 3.1 New components

| Component | Path | Responsibility |
|-----------|------|----------------|
| `ReactionBar` | `apps/web/src/components/messaging/ReactionBar.tsx` | Renders `ReactionSummary[]` as pills below the bubble. Owns click-to-toggle. |
| `ReactionPill` | (inline in `ReactionBar`) | Single pill: emoji + count, highlighted state when `reacted === true`. |
| `ReactionPicker` | `apps/web/src/components/messaging/ReactionPicker.tsx` | Quick-react bar (👍 ❤️ 😂 🎉 🚀 👀) + "•••" button that opens full picker. |

### 3.2 Modified components

**`MessageBubble`** (`messages/page.tsx`, lines 322–362):
- Accept new props: `reactions: ReactionSummary[]`, `currentUserId: string`, `onToggleReaction: (messageId, emoji) => void`, `reactable: boolean` (false for `system` messages).
- Render `<ReactionBar>` under the bubble when `reactions.length > 0`.
- Add a hover "😊 add reaction" button in the existing action row (next to "Reply", line 352) that opens `<ReactionPicker>` positioned via a small popover/anchor.
- Existing `onReply` behavior untouched.

**`messages/page.tsx`** (the page):
- Extend local `Message` interface to include `reactions: ReactionSummary[]`.
- On `fetchChannelMessages`: map API response (already embeds `reactions`) into state.
- Add `handleToggleReaction(messageId, emoji)` — optimistic state update + `POST .../reactions/toggle`; on error, refetch that message's reactions via the GET endpoint and rollback.
- Add a `useEffect` socket listener for `channel:reaction:updated` (see §5) that updates `channelMessages` immutably (replace the matching message's `reactions` array) **only if** `channelId === selectedChannel.id`.

---

## 4. Content Types

**None required.** Reactions are transactional user data in PostgreSQL, not editorial content. They do **not** belong in Strapi (per GOVERNANCE §9: Strapi is for editorial content, not relational user state). 

**Message-type policy (product rule, not a content type):**
| Message `type` | Reactable? | Reason |
|----------------|------------|--------|
| `text` | ✅ | Primary use case |
| `image` | ✅ | Primary use case |
| `file` | ✅ | Acknowledge a deliverable |
| `system` | ❌ | Automated notices (join/leave) — reacting is meaningless and clutters |

This is enforced both server-side (toggle endpoint rejects `system` messages with `400`) and client-side (`MessageBubble` hides the reaction UI for `system`).

---

## 5. Data Flow

### 5.1 Recommended path — Redis pub/sub event bus (the ADR's accepted decision)

```
USER A clicks 👍 on message M in channel C
   │
   ▼
[apps/web] optimistic update: M.reactions[👍].count++, reacted=true
   │
   ▼ POST /api/channels/C/messages/M/reactions/toggle {emoji:"👍"}
[apps/api] ChannelsService.toggleReaction()
   │  ├─ verify membership (RBAC)
   │  ├─ verify message.type !== 'system'
   │  ├─ INSERT ... ON CONFLICT DO NOTHING  (or DELETE if exists)
   │  ├─ recompute ReactionSummary[] for M
   │  └─ publish to Redis channel 'hexa:channel_events':
   │       { type:'reaction:updated', channelId:C, messageId:M,
   │         reactions:[...], actorId:A, action, emoji, timestamp }
   │
   ▼ 200 ReactionSummary[]  →  [apps/web] confirms/aligns optimistic state
   │
   ▼ Redis pub/sub
[apps/realtime] ReactionHandler (subscribed to 'hexa:channel_events')
   │  └─ io.to(`chan:${C}`).emit('channel:reaction:updated', payload)
   │
   ▼
[apps/web] USER B (and A's other tabs) socket listener:
   if payload.channelId === selectedChannel.id:
     replace channelMessages[M].reactions = payload.reactions
```

### 5.2 Why this over alternatives

- **vs. client-emit (`socket.emit('channel:reaction:toggle')`):** Client-emit duplicates the toggle logic in two places (API + realtime server), and the realtime server would need DB access — violating "never access another service's database directly" (GOVERNANCE §Architecture). Rejected.
- **vs. API-internal gateway broadcast:** Would require the frontend to connect to a *second* socket (the in-API gateway), doubling auth/heartbeat cost and entrenching the dual-gateway debt. Rejected.

### 5.3 Idempotency & conflict notes
- Toggle is idempotent at the DB layer (UNIQUE constraint). Duplicate client requests are safe.
- Optimistic UI + server-confirmed response means the client never diverges for more than one round-trip.
- The socket broadcast carries the **full replacement `reactions[]` array**, so concurrent reactions from multiple users always converge to the latest server-computed state (last-writer-wins on the summary, which is itself derived from row-level truth). No client-side count arithmetic on incoming events.

---

## 6. Real-Time Layer Changes (`apps/realtime`)

### 6.1 New socket events (add to `EVENTS` const in `types.ts`)

```typescript
// Server → Client
CHANNEL_REACTION_UPDATED: 'channel:reaction:updated',
```

No new client→server event (the API drives via Redis; clients never emit reaction events).

### 6.2 New Redis subscription

Add a Redis subscriber in `apps/realtime/src/index.ts` bootstrap (alongside the existing `pubClient`/`subClient` used for the socket adapter — use a **dedicated** subscriber client so it doesn't interfere with the adapter):

```typescript
const eventSub = createRedisClient('events');
await new Promise<void>((r) => eventSub.once('ready', r));
await eventSub.subscribe('hexa:channel_events');
eventSub.on('message', (_chan, raw) => {
  const evt = JSON.parse(raw);
  if (evt.type === 'reaction:updated') {
    io.to(`chan:${evt.channelId}`).emit(
      EVENTS.CHANNEL_REACTION_UPDATED,
      evt.payload,
    );
  }
});
```

Add graceful `eventSub.quit()` to the existing `shutdown()` fn (index.ts line 470).

### 6.3 New types in `apps/realtime/src/types.ts`

Mirror `ChannelReactionUpdatedEvent` from `packages/types`. Add to `EVENTS` const and the Redis-keys doc.

---

## 7. API Layer Changes (`apps/api`)

### 7.1 Files to add

| File | Contents |
|------|----------|
| `modules/channels/entities/channel-message-reaction.entity.ts` | TypeORM entity (§2) |
| `modules/channels/dto/toggle-reaction.dto.ts` | `class-validator` DTO (`emoji: string`) |
| `modules/common/events/realtime-publisher.ts` | Injectable that publishes to Redis `hexa:channel_events` (wraps a dedicated `ioredis` publish client) |
| `modules/common/events/channel-events.interface.ts` | `ChannelEvent` discriminated union (`reaction:updated`, extensible to future `message:created` etc.) |

### 7.2 Files to modify

| File | Change |
|------|--------|
| `channels.module.ts` | Register `ChannelMessageReaction` in `TypeOrmModule.forFeature([...])`; provide `RealtimePublisher` |
| `channels.service.ts` | Add `toggleReaction(channelId, messageId, userId, emoji): Promise<ReactionSummary[]>`, `getReactions(messageId)`. Modify `getMessages`/`getThreadedMessages`/`getThreadContext` to load + aggregate `reactions`. After toggle, call `realtimePublisher.publish(...)`. |
| `channels.controller.ts` | Add `@Post(':channelId/messages/:messageId/reactions/toggle')` and `@Get(':channelId/messages/:messageId/reactions')`. |
| `modules/channels/entities/channel-message.entity.ts` | Add `@OneToMany` to `ChannelMessageReaction`. |

### 7.3 Aggregation query (service)

After toggle, build `ReactionSummary[]` in one query:

```sql
SELECT emoji,
       COUNT(*)::int AS count,
       ARRAY_AGG(user_id) AS "userIds"
FROM channel_message_reactions
WHERE message_id = $1
GROUP BY emoji;
```
Then map `reacted = userIds.includes(currentUserId)`. TypeORM equivalent via `createQueryBuilder` with `groupBy`.

---

## 8. Frontend Implementation Plan (`apps/web` + `packages/types`)

### 8.1 Dependency: emoji-mart

**Dependency-governance justification (required per GOVERNANCE §23):**

- **Why needed:** The user-requested full emoji picker. Native `<input type="text">` cannot give a discoverable emoji UX.
- **Choice:** `@emoji-mart/react` + `@emoji-mart/data`. (~45 KB gzipped data set.)
- **Bundle mitigation:** Dynamic `import()` on first open of the picker → **not** in the initial bundle. The quick-react row (6 emojis as static unicode) works with zero JS cost.
- **Lazy boundary:** `ReactionPicker` is itself a candidate for `next/dynamic` with `ssr: false` at the call site in `MessageBubble`.

This must be recorded in the ADR's dependency section and validated against `npm run build` bundle output (PERFORMANCE.md gate).

### 8.2 Files to add

| File | Contents |
|------|----------|
| `packages/types/src/reactions.ts` | Types in §1.1 |
| `packages/types/src/index.ts` | Add `export * from './reactions';` |
| `apps/web/src/components/messaging/ReactionBar.tsx` | Pills + click-to-toggle |
| `apps/web/src/components/messaging/ReactionPicker.tsx` | Quick row + lazy emoji-mart |
| `apps/web/src/lib/api/reactions.ts` | `toggleReaction(channelId, messageId, emoji)`, `fetchReactions(channelId, messageId)` axios wrappers |
| `apps/web/src/lib/hooks/use-reactions.ts` (optional) | Encapsulate optimistic toggle + socket listener; reduces `page.tsx` bloat |

### 8.3 Files to modify

| File | Change |
|------|--------|
| `messages/page.tsx` | (a) Extend `Message` interface with `reactions`. (b) Wire `onToggleReaction` into both `MessageBubble` render sites (DM block ~line 804 and channel block ~line 946 — channel block is primary; DM is a no-op/hidden for this iteration). (c) Add `useEffect` socket listener for `channel:reaction:updated`. (d) Pass `currentUserId={user?.id}` and `reactable={m.type !== 'system'}`. |

### 8.4 Accessibility (WCAG 2.1 AAA — non-negotiable per ACCESSIBILITY.md)

- Each `ReactionPill` is a `<button>` with `aria-label={`React with ${emoji}, ${count} reactions${reacted ? ', you reacted' : ''}`}` and `aria-pressed={reacted}`.
- Picker opens on click **and** on keyboard `Enter`/`Space`; closes on `Escape` and restores focus to the trigger.
- emoji-mart grid must remain keyboard-navigable (it is, by default — verify in QA).
- Reaction counts are announced to screen readers via `aria-live="polite"` region on the `ReactionBar`.
- Respects `prefers-reduced-motion`: the pill highlight transition is disabled under that media query (consistent with the existing `framer-motion` usage in the file).

### 8.5 Performance (PERFORMANCE.md gate)

- Lazy-load emoji-mart (see §8.1).
- Memoize `ReactionBar`/`MessageBubble` with `React.memo` + referential-stable callbacks (`useCallback`) — the messages list can be long; avoid re-rendering all bubbles when one reaction changes. Key the list by `m.id` (already done).
- Socket updates replace a single message's `reactions` array immutably (`map` to new array) — no full refetch.

---

## 9. Step-by-Step Implementation Plan

Ordered so each step is independently verifiable. Quality gates (lint/typecheck/test per workspace) run after the relevant step.

### Phase A — Backend persistence (no realtime yet)

1. **A1.** Add `ChannelMessageReaction` entity + `@OneToMany` on `ChannelMessage`.
2. **A2.** Create TypeORM migration (`up`: create table + indexes + FK; `down`: drop). Run locally; verify reversibility.
3. **A3.** Register entity in `channels.module.ts`.
4. **A4.** Add `ToggleReactionDto` (class-validator).
5. **A5.** Implement `ChannelsService.toggleReaction()` + `getReactions()`; modify `getMessages`/`getThreadedMessages`/`getThreadContext` to embed `reactions`.
6. **A6.** Add controller routes (`POST .../toggle`, `GET .../reactions`).
7. **A7.** Backend gate: `npm run lint --workspace=apps/api && npm run typecheck --workspace=apps/api && npm run test --workspace=apps/api`. Add unit tests for `toggleReaction` (add → remove → add, non-member 403, system-message 400, orphan message 404).

**Milestone:** Reactions persist and are returned by `GET /channels/:id/messages`. No realtime.

### Phase B — Realtime event bus

8. **B1.** Create `RealtimePublisher` (API side) — dedicated `ioredis` publish client, `publish(channel, payload)`.
9. **B2.** Define `ChannelEvent` discriminated union; wire `ChannelsService.toggleReaction` to publish `reaction:updated` after DB write.
10. **B3.** Register `RealtimePublisher` in a new `EventBusModule`, import into `ChannelsModule`.
11. **B4.** In `apps/realtime/src/index.ts`: add dedicated event-subscriber Redis client, subscribe to `hexa:channel_events`, broadcast `channel:reaction:updated` to `chan:${channelId}`. Add to `shutdown()`.
12. **B5.** Add `CHANNEL_REACTION_UPDATED` to `EVENTS` const and `ChannelReactionUpdatedEvent` to realtime `types.ts`.
13. **B6.** Realtime gate: manual two-browser smoke test (react in one → appears in other). Add an integration test if a realtime test harness exists; otherwise document the manual test in the MR.

**Milestone:** Reactions sync live across clients.

### Phase C — Frontend

14. **C1.** Add `packages/types/src/reactions.ts`; export from `index.ts`. Build the types package.
15. **C2.** Add `lib/api/reactions.ts` axios wrappers.
16. **C3.** Build `ReactionBar` + `ReactionPill` (static, no picker yet). Storybook/component test if harness exists.
17. **C4.** Modify `MessageBubble` to render `ReactionBar` and wire `onToggleReaction`; pass `reactable`.
18. **C5.** Wire `messages/page.tsx` for channels: extend `Message` type, optimistic toggle, error-rollback refetch, socket listener for `channel:reaction:updated`.
19. **C6.** Add `ReactionPicker` with static quick-react row → verify toggling works end-to-end.
20. **C7.** Add `@emoji-mart/react` + `@emoji-mart/data`; dynamic-import the full picker behind the "•••" button. Verify bundle isolation (`npm run build --workspace=apps/web`, check the picker is in a separate chunk).
21. **C8.** Accessibility pass (§8.4) and reduced-motion check.
22. **C9.** Frontend gate: `npm run lint --workspace=apps/web && npm run typecheck --workspace=apps/web && npm run test --workspace=apps/web`.

### Phase D — Closeout

23. **D1.** Write ADR-012 (§10).
24. **D2.** Update `PROJECT_STATUS.md` (reactions shipped; realtime bridge established as reusable infra).
25. **D3.** Open MR with all gates green; request Security + Performance review (HIGH-risk items per GOVERNANCE §36: DB migration + authz).

---

## 10. ADR-012 Outline (to be authored)

```markdown
# ADR-012: Channel Message Reactions & Realtime Event Bus
Status: Proposed   Date: <sprint>   Decider: Architect

## Context
- Channel messaging lacks reactions (product gap vs Slack/Discord benchmarks).
- No API→Realtime bridge exists; channel messages aren't delivered live today.
- Two divergent realtime systems exist (standalone apps/realtime vs in-API gateway).

## Problem
1. Persist per-user emoji reactions with toggle semantics.
2. Sync reaction state live to all channel members without the realtime server
   touching the database.

## Decision
1. New `channel_message_reactions` table; UNIQUE(message,user,emoji); toggle
   via single POST endpoint returning full ReactionSummary[].
2. Establish a Redis pub/sub event bus ('hexa:channel_events') between the
   NestJS API (publisher) and the standalone apps/realtime server (subscriber).
   The API is the sole writer to Postgres; the realtime server only relays.
3. Target the standalone apps/realtime server. Do NOT extend the in-API gateway
   (mark for deprecation — separate cleanup ADR).
4. Full emoji-mart picker, lazy-loaded to protect the initial bundle.

## Alternatives Considered
- A. Client-emit socket events for reactions → REJECTED: duplicates toggle
  logic; forces DB access in the realtime server; violates decoupling.
- B. REST pair POST/DELETE instead of toggle → REJECTED: emoji-in-DELETE-path
  is awkward; toggle matches the single-click UX and is idempotent.
- C. Reactions as a JSONB column on channel_messages instead of a table →
  REJECTED: loses per-row integrity, harder to index per-user, harder to
  cascade-delete on user removal.
- D. Build the in-API gateway into the primary realtime server → REJECTED:
  doubles socket connections; entrenches existing dual-gateway debt.

## Consequences
- (+) Establishes reusable event-bus infra for future live features
  (typing-v2, live message delivery, presence-v2).
- (+) Clean ownership: API owns state, realtime owns transport.
- (−) Adds one Redis pub/sub channel and a subscriber client to maintain.
- (−) emoji-mart adds ~45 KB (lazy) — accepted, monitored.

## Migration
- TypeORM migration (up/down) — reversible.
- No data backfill (new feature).

## Rollback
- Drop the new endpoints + entity + migration (down).
- Remove socket listener + components on the frontend.
- The Redis event bus can stay (no harm) or be removed; it is forward-compatible.

## Open Questions
- Should DMs (1:1) also get reactions in a follow-up? (Out of scope this iteration.)
- Deprecate/remove the in-API realtime gateway — separate ADR.
```

---

## 11. Risks & Trade-offs Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| Redis pub/sub bridge is new infra → possible message loss on subscriber disconnect | Medium | Reactions are persisted first; the next `GET /messages` reconciles. Pub/sub is a notification channel, not the source of truth. |
| emoji-mart bundle bloat | Medium | Lazy/dynamic import; quick-react row is zero-cost. Monitor in build. |
| Concurrent reaction race | Low | DB UNIQUE constraint + server-computed summary broadcast → convergent. |
| Dual-gateway confusion | Medium (existing) | This SPEC avoids the dead gateway; flag for deprecation ADR. |
| Optimistic UI rollback complexity | Low | Standard pattern; refetch single message's reactions on error. |
| System-message reactability | Low | Enforced server-side (400) + client-side (hidden UI). |

---

## 12. Out of Scope (this iteration)

- Reactions on **DM** (1:1) messages — only channels. (DMs use a different table `messages`; can be added later by mirroring this design.)
- Reaction notifications ("X reacted to your message").
- Custom workspace emoji / emoji aliases.
- Deprecating the in-API `realtime.gateway.ts` (separate ADR).
- Live delivery of new channel messages (this SPEC only adds the *bridge*, used by reactions; wiring it to `message:created` is a natural follow-up).

---

### Next step

This SPEC is ready to be saved (e.g. as `docs/product/SPEC-channel-reactions.md`) and the ADR-012 drafted. Two things I'd like your sign-off on before implementation begins:

1. **Confirm the Redis pub/sub bridge** is acceptable scope (it's the right call, but it's infra-creating, not just a feature).
2. **Confirm DM reactions are out of scope** for this iteration (so we don't over-build).

Want me to proceed to drafting ADR-012 in full, or adjust any part of this spec first?
