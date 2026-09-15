# microservice-research

Personal blog + backend, one pnpm workspace.

```
apps/web   Next.js 15 blog: posts, knowledge graph, english-learning, playground, tools  (port 5006)
apps/api   NestJS: news crawler, english-learning (readings + conversations), Piper TTS   (port 3000)
```

## Run

```bash
pnpm install
pnpm db                 # MongoDB via docker compose
cp apps/api/.env.example apps/api/.env   # set API_KEY
cp apps/web/.env.example apps/web/.env.local
pnpm dev                # web :5006 + api :3000
```

TTS (optional, needed for conversation audio): `pnpm --filter api setup:tts` installs Piper into `apps/api/tools/`.
Needs `python3` and `lame` (`brew install lame`).

## API (prefix `/api`)

| Route | Auth | Notes |
|---|---|---|
| `GET /news`, `/news/tags`, `/news/:id` | – | paginated, `?q=&tag=&page=&limit=` |
| `POST /news/crawl` | `x-api-key` | also runs on `CRAWLER_CRON` (default 01:00 UTC) |
| `GET /readings`, `/readings/:id` | – | `?level=&topic=&q=&page=&limit=` |
| `POST /readings` | `x-api-key` | body `{ title, content, level, topic, quizzes? }` |
| `GET /conversation`, `/:id`, `/:id/audio/:line`, `/:id/audio-status` | – | |
| `POST /conversation` | `x-api-key` | body `{ topic, difficulty?, dialogue: [{ speaker, text }] }`; Piper audio per line |
| `POST /conversation/:id/regenerate-audio`, `/regenerate-all-audio` | `x-api-key` | |
| `POST /tts/generate` (wav stream), `/tts/generate-buffer?format=mp3` | – | body `{ text, model? }` |
| `GET /health` | – | |

## Content generation

No AI provider is wired in. Readings and conversations are plain CRUD: generate content with whatever
model you like (local LLM, MCP tool, script) and `POST` it with `x-api-key`. The API only stores it and
synthesizes audio.

## Deploy

- `apps/web` → Vercel (`apps/web/vercel.json`).
- `apps/api` → any Docker host: `docker compose up -d` (image bundles Piper + two voice models).
