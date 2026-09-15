# MCP server for apps/api

Date: 2026-09-15. Branch: `chore/consolidate`.

## Goal

Let a local LLM (via Claude Desktop / Claude Code) generate english-learning content and use Piper TTS through
MCP tools, without any AI provider wired into the repo. The API stays plain CRUD.

## Decision

New workspace package `apps/mcp`: a **stdio** MCP server that wraps the HTTP API of `apps/api`.
stdio works in both Claude Desktop and Claude Code with no auth plumbing. The API is not modified.

Rejected: embedding Streamable HTTP `/mcp` in `apps/api` (Claude Desktop custom connectors expect OAuth, no
header slot for `x-api-key`; TTS would have to return base64).

## Package

```
apps/mcp/
  package.json      name "mcp", bin "pika-mcp", deps: @modelcontextprotocol/sdk, zod; dev: typescript, @types/node
  tsconfig.json     ESM, NodeNext, outDir dist
  src/index.ts      server + tool registrations (single file, ~150 lines)
```

Scripts: `build` (tsc), `dev` (tsx watch not needed — `node dist/index.js`), `typecheck`.

## Config (env)

| Var | Default | Use |
|---|---|---|
| `API_URL` | `http://localhost:3000/api` | base URL of apps/api |
| `API_KEY` | – | sent as `x-api-key` on write tools |
| `TTS_OUTPUT_DIR` | `~/Downloads` | where `text_to_speech` writes mp3 |

Claude Desktop / Code config:

```json
{ "mcpServers": { "pika": { "command": "node", "args": ["<repo>/apps/mcp/dist/index.js"],
  "env": { "API_URL": "http://localhost:3000/api", "API_KEY": "..." } } } }
```

## Tools

| Tool | Input (zod) | Calls | Returns |
|---|---|---|---|
| `list_readings` | `level?, topic?, q?, page?, limit?` | `GET /readings` | JSON text |
| `get_reading` | `id` | `GET /readings/:id` | JSON text |
| `create_reading` | `title, content, level, topic, quizzes?[{question, options[{answer,isCorrect}], explanation?}]` | `POST /readings` | saved doc JSON |
| `list_conversations` | – | `GET /conversation` | JSON (no audio) |
| `get_conversation` | `id` | `GET /conversation/:id` | JSON (no audio) |
| `create_conversation` | `topic, difficulty?, dialogue[{speaker,text}]` | `POST /conversation` | saved doc JSON (audio stripped) |
| `list_news` | `q?, tag?, page?, limit?` | `GET /news` | JSON text |
| `get_news` | `id` | `GET /news/:id` | JSON text |
| `text_to_speech` | `text, model? (en_US-ryan-low), fileName?` | `POST /tts/generate-buffer?format=mp3` | `{ path, bytes }` |

Tool descriptions state the CEFR levels (A1–C2), speaker convention (`Person A`/`Person B` → male/female
voice) and that `create_conversation` is slow (Piper runs per line).

## Errors

One `api()` helper: non-2xx → throw `Error("<status> <method> <path>: <body>")`. The SDK turns thrown errors
into `isError` tool results. Missing `API_KEY` on a write tool → clear error before the request.

## Testing

No test suite. Verification: `pnpm --filter mcp build`, then `npx @modelcontextprotocol/inspector node
apps/mcp/dist/index.js` against a running api; call `list_readings` and `text_to_speech` once.

## Out of scope

`crawl_news` tool, HTTP transport, auth beyond the shared key, packaging/publishing the bin.
