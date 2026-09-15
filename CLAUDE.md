# microservice-research

Personal blog + backend. pnpm workspace, Node 20 (`.nvmrc`). Solo project.

## Layout

| Path | What | Run |
|---|---|---|
| `apps/web` | Next.js 15 blog (posts via contentlayer, english-learning UI, playground, tools) | `pnpm dev:web` → :5006 |
| `apps/api` | NestJS: news crawler, readings + conversations CRUD, Piper TTS | `pnpm dev:api` → :3000/api |
| `apps/mcp` | stdio MCP server exposing the API as tools for Claude Desktop/Code | `pnpm --filter mcp build` |

Infra: `docker-compose.yml` (mongo + api). `pnpm db` starts Mongo only.

## Branch flow

- `main` = production. `develop` = integration. Work happens on `develop` or short `feature/*` branches off it.
- Never commit directly to `main`. `main` moves only by fast-forward merge from `develop`:
  `git checkout main && git merge --ff-only develop && git push`.
- Stage specific files; never `git add .` / `-A`.

## Rules

- **No AI provider SDKs or API keys in this repo.** Content generation happens in the MCP client (local model).
  `apps/api` only stores content (`POST /readings`, `POST /conversation`) and synthesizes audio.
- Write endpoints are guarded by `ApiKeyGuard` (`x-api-key` = `API_KEY` env). New write routes must use it.
- Piper TTS stays an independent module (`apps/api/src/tts`, exports `PiperService`); other features inject
  it, never call it over HTTP.
- No Redis/Bull. Background work = `@nestjs/schedule` cron inside the api or direct calls.
- Mongoose schemas live in `apps/api/src/common/schemas`; import from that barrel.
- Web reads the API through `NEXT_PUBLIC_GATEWAY_URL` (default `http://localhost:3000/api`); never hardcode hosts.
- Don't add markdown session logs / `*_COMPLETE.md` files. Docs go in `readme.md` or `docs/`.
- Code, comments, commits in English. Chat in Vietnamese is fine.

## Verify before commit

```bash
pnpm --filter api typecheck && pnpm --filter api lint && pnpm --filter api build
pnpm --filter web type-check && KEYSTATIC_GITHUB_CLIENT_ID=x KEYSTATIC_GITHUB_CLIENT_SECRET=x KEYSTATIC_SECRET=x pnpm --filter web build
pnpm --filter mcp build
```

No test suite; build + typecheck + lint is the gate. Web build needs dummy `KEYSTATIC_*` locally.

## Env

- `apps/api/.env` (from `.env.example`): `MONGO_URI`, `API_KEY`, optional `CRAWLER_CRON`, `PIPER_BIN`, `PIPER_MODELS_DIR`.
- `apps/web/.env.local` (from `.env.example`): Giscus, Keystatic, feature flags, `NEXT_PUBLIC_GATEWAY_URL`, Supabase (co-browsing).
- MCP client env: `API_URL`, `API_KEY`, `TTS_OUTPUT_DIR` (see `.mcp.json`).
