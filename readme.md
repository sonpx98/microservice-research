# microservice-research

Personal blog + backend, one pnpm workspace.

```
apps/web   Next.js 16 blog: posts, knowledge graph, english-learning, playground, tools  (port 5006)
apps/api   NestJS: news crawler, english-learning (readings + conversations), Piper TTS   (port 3000)
apps/mcp   stdio MCP server exposing the API as tools for Claude Desktop / Claude Code
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

## Content generation via MCP

No AI provider is wired in. The model runs in your MCP client (Claude Desktop, Claude Code, ...) and
pushes content through `apps/mcp`, a stdio server wrapping the API.

```bash
pnpm --filter mcp build
```

Claude Desktop `claude_desktop_config.json` / Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "pika": {
      "command": "node",
      "args": ["/absolute/path/microservice-research/apps/mcp/dist/index.js"],
      "env": { "API_URL": "http://127.0.0.1:3000/api", "API_KEY": "<same as apps/api .env>" }
    }
  }
}
```

Tools: `list_readings`, `get_reading`, `create_reading`, `list_conversations`, `get_conversation`,
`create_conversation`, `list_news`, `get_news`, `text_to_speech` (writes mp3 to `TTS_OUTPUT_DIR`, default
`~/Downloads`). Write tools send `x-api-key`; `create_conversation` is slow because Piper renders every line.

## Deploy

- `apps/web` → Vercel (`apps/web/vercel.json`).
- `apps/api` → any Docker host: `docker compose up -d` (image bundles Piper + two voice models).
