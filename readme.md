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
cp apps/api/.env.example apps/api/.env   # fill API_KEY + GROQ/GEMINI key
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
| `POST /readings/generate` | `x-api-key` | scheduler also generates A1–C2 daily at 02:00/10:00 UTC |
| `GET /conversation`, `/:id`, `/:id/audio/:line`, `/:id/audio-status` | – | |
| `POST /conversation/generate`, `/:id/regenerate-audio`, `/regenerate-all-audio` | `x-api-key` | scheduler at 00:00/08:00 UTC |
| `POST /tts/generate` (wav stream), `/tts/generate-buffer?format=mp3` | – | body `{ text, model? }` |
| `GET /health` | – | |

## Deploy

- `apps/web` → Vercel (`apps/web/vercel.json`).
- `apps/api` → any Docker host: `docker compose up -d` (image bundles Piper + two voice models).
