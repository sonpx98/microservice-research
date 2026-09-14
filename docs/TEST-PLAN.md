# fe-practice-hub — Test & Automation Plan

A plan for testing this app end to end. It doubles as a practice track: each layer teaches a
different testing skill (pure unit, integration with a real server, browser E2E, CI automation).

Build it in the phases at the bottom — don't write everything at once.

---

## 1. Philosophy

Standard test pyramid, weighted to where bugs actually live in this app:

```
        /\        E2E (Playwright)         few, slow, high-confidence
       /  \       — auth flow, realtime chat across 2 users, a WebRTC call
      /----\
     /      \     Integration              some, medium
    /        \    — REST endpoints, WS flow, React Query + WS cache merge
   /----------\
  /            \  Unit                      many, fast
 /______________\ — auth.mjs, db.mjs, store reducers, query pagination
```

**Prioritise by blast radius**, not by what's easy:
1. `server/auth.mjs` — a bug here is a security hole. Highest value, easiest to test (pure functions).
2. `src/store.ts` `upsertMessage` — the optimistic/reconcile/dedupe logic is the trickiest code in
   the app and silently corrupts the message list when wrong.
3. Auth + realtime E2E — the flows a user actually depends on.

**Don't test:** third-party libraries (React Query, react-router, ws), trivial getters, CSS,
generated types. Test *your* logic and *your* wiring.

---

## 2. Tooling

| Layer | Tool | Why |
|-------|------|-----|
| Unit + integration | **Vitest** | Same esbuild/vite pipeline the app uses; fast; TS + ESM native |
| Component | **@testing-library/react** + `jsdom` env | User-facing assertions, no implementation coupling |
| Fetch mocking (client unit) | **MSW** (Mock Service Worker) | Intercepts `fetch` at the network layer; reused in E2E if needed |
| Server integration | Vitest + the **real http server** on an ephemeral port + `node:sqlite` `:memory:` | Tests the actual routes, not a mock |
| E2E | **Playwright** | Multi-context (two users in one test), `--use-fake-device-for-media-stream` for WebRTC |
| CI | **GitHub Actions** | Runs unit + integration on every push; E2E on PR |

Install (phase 1): `pnpm add -D vitest @testing-library/react @testing-library/user-event jsdom msw`
Install (phase 3): `pnpm add -D @playwright/test && npx playwright install chromium`

`package.json` scripts to add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"coverage": "vitest run --coverage"
```

---

## 3. Layer 1 — Unit tests (pure logic)

### `server/auth.test.mjs` — the security core (write first)
- `hashPassword` → `verifyPassword` round-trips for the correct password.
- `verifyPassword` returns false for a wrong password.
- Two hashes of the same password differ (random salt) but both verify.
- `signToken` → `verifyToken` round-trips the payload (`sub`, `name`).
- **`verifyToken` rejects an `alg: none` token** (forge `{"alg":"none"}`, empty signature) → `null`.
- **`verifyToken` rejects a token signed with a different secret / tampered payload** → `null`.
- `verifyToken` rejects an expired token (sign with `ttlSeconds = -1`).
- `verifyToken` rejects malformed input (`""`, `"a.b"`, `"a.b.c.d"`).

### `server/db.test.mjs` — persistence (use a `:memory:` DB)
> Refactor `db.mjs` to accept a path/handle (e.g. `HUB_DB=:memory:` env or an exported factory) so a
> test gets an isolated database. Currently it opens a fixed file — small change, do it in phase 1.
- Seed creates `general` + `random` exactly once (idempotent across re-open).
- `createUser` then `getUserByName` returns the row; duplicate username throws (UNIQUE).
- `addMessage` then `getMessages` returns it; fields map camelCase correctly.
- `getMessages` keyset pagination: insert 50, page of 30 newest DESC, then `before` cursor returns
  the next 20 with no overlap.

### `src/store.test.ts` — `upsertMessage` reconcile/dedupe (the trickiest client logic)
> Extract `upsertMessage` (and the optimistic builder) as a pure function taking the old cache and a
> message, returning the new cache — so it's testable without a live socket. Thin refactor.
- Optimistic add: pending message lands at the front of page 0.
- Echo with same `clientMsgId` **replaces** the pending copy (no duplicate, `pending` cleared).
- Echo for a message from another user **appends** (front of page 0).
- Duplicate echo (same `id` twice) is a no-op.
- Message for a channel with no cache yet → no throw, returns unchanged.

### `src/queries.test.ts`
- `getNextPageParam` returns the oldest ts when a full page (30) came back.
- `getNextPageParam` returns `undefined` when a partial page (< 30) came back (end of history).

---

## 4. Layer 2 — Integration tests

### `server/api.integration.test.mjs` — REST against the real server
Boot the http server on port 0 (ephemeral), `:memory:` DB, hit it with `fetch`.
- `POST /api/register` → 201 + token; duplicate → 409; bad username/short password → 400.
- `POST /api/login` correct → 200 + token; wrong password → 401; unknown user → 401.
- `GET /api/channels` without token → 401; with token → 200 + seeded channels.
- `GET /api/me` with a **tampered** token → 401 (ties the auth unit test to the middleware).
- `GET /api/channels/:id/messages` pagination: seed messages, assert `limit` + `before` behavior;
  unknown channel → 404.

### `server/ws.integration.test.mjs` — WebSocket flow
Boot server, connect a real `ws` client.
- Upgrade **without** a token → connection rejected (401 / close).
- Upgrade **with** a token → receives `welcome` + `presence`.
- `sub` then `msg` → broadcaster receives `msg`; the message is **persisted** (assert via a REST
  `GET …/messages` afterward).
- `typing` true/false → other client receives `typing` with the right channel + names.
- Two clients: presence lists both; on one disconnect, the other gets an updated `presence`.
- WebRTC relay: client A sends `call-request {to: B}` → **only** B receives it, tagged `from: A`.

### `src/components/*.test.tsx` — component + RQ integration (jsdom + MSW)
- `<Login>`: submit calls the API (MSW), on success stores auth + navigates; on 401 shows the error.
- `<ChannelList>`: renders channels from a mocked `GET /api/channels`; active link reflects the route.
- `<MessageList>`: renders a mocked infinite page; "Load older" fetches the next page and prepends;
  a simulated `upsertMessage` (live push) appears at the bottom.
- `<Composer>`: Enter sends + clears; Shift+Enter does not; typing emit fires then auto-clears.

---

## 5. Layer 3 — E2E (Playwright)

`e2e/` with `playwright.config.ts` that starts `pnpm dev` (webServer) and uses a throwaway DB
(point `HUB_DB` at a temp file, delete between runs).

### `e2e/auth.spec.ts`
- Register → lands in `#general`. Reload → still authed (token persisted). Log out → back to /login.
- Protected route `/c/:id` while logged out → redirected to `/login`.

### `e2e/chat.spec.ts` — **two browser contexts = two users** (the realtime test)
- User A and User B both open the app and register.
- A sends a message → **B sees it** without reload (WebSocket push).
- A starts typing → B sees A's typing indicator; it clears after idle.
- B appears in A's presence list; when B closes, B drops off A's list.

### `e2e/call.spec.ts` — WebRTC with fake media
Launch Chromium with `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` so
`getUserMedia` returns a synthetic stream with no real camera and no permission prompt.
- A clicks 📞 on B → B sees the incoming-call prompt → B accepts.
- Both reach `in-call`; assert each side has a remote `<video>` with a live `srcObject`
  (`readyState`/`videoWidth > 0`), i.e. the offer/answer/ICE handshake actually completed.
- A hangs up → both return to idle.

> This is the highest-value test in the whole suite: it's the only thing that proves the WebRTC
> pipeline end to end, and it's exactly the flow you can't easily check by hand with one webcam.

---

## 6. Automation (CI)

`.github/workflows/ci.yml`:
```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }   # 22.5+ for node:sqlite
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test            # unit + integration (fast)
      - run: pnpm build
  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```
Split so unit/integration gate every push cheaply and the slow E2E job runs after they pass.

---

## 7. Coverage targets

- `server/auth.mjs`, `server/db.mjs`, `src/store.ts` reducers: **~100%** (small, critical).
- Overall line coverage: **70–80%** is plenty for a learning app; chase behaviors, not the number.
- Every bug you hit by hand → write the failing test first, then fix (regression discipline).

---

## 8. Phased rollout

- **Phase 1 — unit + the two testability refactors. ✅ DONE** (21 tests, `pnpm test`). Vitest setup, `auth.test.mjs`,
  `db.test.mjs` (+ inject DB path), `store.test.ts` (+ extract pure `upsertMessage`), `queries`.
  Fast win, highest value, forces two small refactors that make the code cleaner anyway.
- **Phase 2 — integration. ✅ DONE** (REST + WS on a real ephemeral server; Login/ChannelList/MessageList/Composer via MSW). REST + WS against the real server; component tests with MSW.
- **Phase 3 — E2E. ✅ DONE** (Playwright: auth, two-user chat, WebRTC call with fake media). Playwright: auth, then two-user chat, then the fake-media call.
- **Phase 4 — CI.** Wire the GitHub Actions workflow; make green a merge gate.

---

## 9. Test file map

```
server/
  auth.test.mjs
  db.test.mjs
  api.integration.test.mjs
  ws.integration.test.mjs
src/
  store.test.ts
  queries.test.ts
  test/setup.ts            # jsdom + MSW server lifecycle
  mocks/handlers.ts        # MSW request handlers
  components/
    Login.test.tsx
    ChannelList.test.tsx
    MessageList.test.tsx
    Composer.test.tsx
e2e/
  playwright.config.ts
  auth.spec.ts
  chat.spec.ts
  call.spec.ts
.github/workflows/ci.yml
vitest.config.ts
```
