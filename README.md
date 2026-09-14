# fe-practice-hub

A local practice ground for **comprehensive frontend + realtime + WebRTC**, built as one full-stack
app (team-hub / Discord-mini) so a single codebase forces you through most real FE patterns instead
of scattered demos.

## What it covers

| Area | Where |
|------|-------|
| Realtime chat, presence, typing | WebSocket (`server/index.mjs`, `src/store.ts`) |
| Optimistic send + server reconciliation | `src/store.ts` `upsertMessage` (merges into the RQ cache) |
| Auto-reconnect (exponential backoff) | `src/socket.ts` |
| WebRTC 1-1 voice/video | `src/call.ts`, `src/components/CallPanel.tsx`, signaling relay in `server/index.mjs` |
| Server state: cache, pagination, invalidation | React Query (`src/queries.ts`) — channels + infinite message history |
| Routing (URL = source of truth) | react-router (`src/router.tsx`), `/login`, `/c/:channelId` |
| Auth: password hashing + JWT | `server/auth.mjs` (scrypt + HS256), `src/auth.ts`, `src/api.ts` |
| Persistence | SQLite via `node:sqlite` (`server/db.mjs`) |

## Run

```bash
pnpm install
pnpm dev          # ws+REST server (:8787) + vite (:5173) together
```

Open http://localhost:5173, **register** a user, and you're in `#general`. Open a second browser
(or incognito) with another account to see realtime chat, presence, typing, and to place a call.

- `pnpm dev:server` / `pnpm dev:client` — run halves separately.
- `pnpm typecheck` / `pnpm build`.
- `HUB_JWT_SECRET=… pnpm dev:server` — override the dev-only JWT secret.

## Architecture

```
server/
  db.mjs        SQLite: users, channels, messages (+ seed, keyset pagination)
  auth.mjs      scrypt password hash/verify, JWT HS256 sign/verify (rejects alg:none, checks exp)
  index.mjs     http REST (/api/*) + WebSocket (/ws, token-authed upgrade): live chat, presence,
                typing, and WebRTC signaling relay
src/
  auth.ts       auth store (token + user in localStorage)
  api.ts        REST wrapper (bearer header, 401 → logout)
  query-client.ts / queries.ts   React Query client + hooks (useChannels, useMessages infinite)
  socket.ts     one shared WebSocket: token connect, reconnect, pub/sub
  store.ts      chat store (presence/typing/status) + live WS → React Query cache merge
  call.ts       WebRTC store (offer/answer/ICE, media, call control)
  router.tsx    routes + auth guard
  components/    Login, ChatLayout, ChannelList, ChannelView, MessageList, Composer,
                 TypingLine, Presence, CallPanel
```

**The interesting integration:** message history is paginated over REST into a React Query infinite
cache; live WebSocket messages are merged into that same cache (`upsertMessage`), so historical and
realtime data share one source of truth, and optimistic sends reconcile by `clientMsgId`.

## Testing a call

1. `pnpm dev`, open the app in **two browsers** with two accounts.
2. Sidebar → 📞 next to the other user → they Accept → grant camera/mic.
3. In-call: mute mic, toggle camera, hang up.

> One physical webcam feeds one tab, so the second participant auto-falls back to audio-only.
> STUN alone covers localhost / same-LAN; calls across different NATs need a TURN server (e.g.
> `coturn`). WebRTC in production requires HTTPS (secure context).

## Security notes (this is a learning app)

- JWT lives in `localStorage` — readable by any XSS. An httpOnly cookie resists XSS but needs CSRF
  defense. The tradeoff is deliberately left visible (`src/auth.ts`).
- `auth.mjs` rejects `alg: none` and non-HS256 tokens on purpose — the attack the security-lab
  `jwt-alg-none` lab demonstrates.
- Dev JWT secret is hardcoded with a note; real apps load it from the environment.

See `docs/TEST-PLAN.md` for the testing + automation strategy.
