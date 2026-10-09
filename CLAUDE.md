# microservice-research

Personal blog + backend. pnpm workspace, Node 24 (`.nvmrc`). Solo project.

## Layout

| Path | What | Run |
|---|---|---|
| `apps/web` | Next.js 16 portfolio: blog, knowledge graph (with the runtime visualizer), security playground. Unlinked personal tool: english-learning | `pnpm dev:web` → :5006 |
| `apps/api` | NestJS: news crawler, readings + conversations CRUD, Piper TTS | `pnpm dev:api` → :3000/api |
| `apps/mcp` | stdio MCP server exposing the API as tools for Claude Desktop/Code | `pnpm --filter mcp build` |
| `apps/practice-hub` | Realtime chat practice app: Vite SPA + node `http`/`ws`/`node:sqlite`. Shares only `packages/theme` with web | `pnpm dev:hub` → :5173 + :8787 |
| `packages/theme` | Design tokens: one contract, theme presets (`blueprint` light/dark, `terminal`) as plain CSS variables | imported by web and hub |

Infra: `docker-compose.yml` (mongo + api). `pnpm db` starts Mongo only.

## Branch flow

- `master` = production. `develop` = integration. Work happens on `develop` or short `feature/*` branches off it.
- Never commit directly to `master`. `master` moves only by fast-forward merge from `develop`:
  `git checkout master && git merge --ff-only develop && git push`.
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
- `apps/practice-hub` keeps its own stack (react-router, zustand, Vitest, Playwright) and its own storage.
  Don't wire it into `apps/api` or next-intl; it shares only the theme package.
- Portfolio scope: the header nav lists only the three pillars (blog, knowledge graph, playground).
  New features either strengthen a pillar or stay unlinked. No feature-flag system; leave a link out instead.
- Code, comments, commits in English. Chat in Vietnamese is fine.

## Styling

- **Colors come only from theme tokens.** Use token utilities (`bg-card`, `text-muted-foreground`,
  `border-border`, `bg-danger/10`). No Tailwind palette classes (`gray-*`, `blue-*`, `white`, `black`),
  no arbitrary colors (`bg-[#...]`), no color literals, inline color styles or SVG color attributes, no decorative
  gradients (a scrim fading to `overlay` is fine). Text on a filled token uses that token's `-foreground`;
  text over an image scrim uses `overlay-foreground`.
  `pnpm --filter web lint` runs `scripts/lint-tokens.mjs` and fails on any of these.
- Tokens switch with the mode by themselves, so never pair a token with a `dark:` color variant.
- Token contract lives in `packages/theme/theme.css`. A new theme = a new `[data-theme="name"]` block that
  defines every contract token. A subtree opts in with `data-theme`; the playground layout and the hub use `terminal`.
- New color needs: reuse status (`success`/`warning`/`danger`/`info`), `highlight` or `chart-1..5` first.
  Add a contract token only when none fits, and add it to every theme block plus the `@theme inline` map.
- Third-party widgets (reactflow, shiki, typography) are themed in `apps/web/src/app/globals.css`, never in components.
- **Build pages from the kit, not from raw markup.** `pnpm --filter web lint` also runs `scripts/lint-layout.mjs`.
  - Page templates (`components/layout`): `PageShell` (standard), `FullBleedPage` (full-height canvas),
    `ArticleLayout` (long-form, owns `.prose`), `LabShell` (playground labs). They own page widths
    (`max-w-3xl` prose, `max-w-6xl` wide); pages never set `container` or `max-w-{4,5,7}xl`.
  - Blocks (`components/layout`): `Section` (h2), `Panel` (the one surface: border, no shadow, rounded-lg, h3
    header), `Callout` (tinted note), `ContentCard` (article lists), `ViewSwitch` (URL tabs), `Thumbnail`.
  - Primitives (`components/ui`): `Button`, `Input`, `Textarea`, `Select`, `Chip` / `ChipGroup` (filters),
    `SearchDialog` (every search box), `Dialog` (all overlays; `placement="bottom"` for sheets),
    `DropdownMenu`, `Tabs`, `CodeBlock`, `Fab` / `FloatingCard` (floating chrome).
  - Scale: surfaces `rounded-lg`, controls `rounded-md`, pills `rounded-full`. Surfaces use a border; only
    overlays and floating chrome cast a shadow. Headings: page h1 (PageHeader), h2 (Section), h3 (Panel).
  - Outside `components/ui` and `components/layout` the guard rejects raw `<button>` / `<input>` / `<textarea>`,
    `fixed inset-0`, `rounded-{xl,2xl,3xl}`, `shadow-{md,lg,xl,2xl}` and ad-hoc page widths. A genuine
    exception carries `layout-exempt: <reason>` on the same line.
  - Playground labs compose `playground/_kit` (LevelSelector, SuccessPanel, AttemptsHistory, ResultDialog,
    LabLoading); never copy those per lab.
## Verify before commit

```bash
pnpm --filter api typecheck && pnpm --filter api lint && pnpm --filter api build
pnpm --filter web type-check && KEYSTATIC_GITHUB_CLIENT_ID=x KEYSTATIC_GITHUB_CLIENT_SECRET=x KEYSTATIC_SECRET=x pnpm --filter web build
pnpm --filter mcp build
pnpm --filter practice-hub typecheck && pnpm --filter practice-hub test && pnpm --filter practice-hub build
```

No test suite except `apps/practice-hub` (Vitest + Playwright); elsewhere build + typecheck + lint is the gate. Web build needs dummy `KEYSTATIC_*` locally.
Web `lint` includes the token guard. Web `build` runs `contentlayer2 build` first (a clean `next build` alone races contentlayer generation).

## Env

- `apps/api/.env` (from `.env.example`): `MONGO_URI`, `API_KEY`, optional `CRAWLER_CRON`, `PIPER_BIN`, `PIPER_MODELS_DIR`.
- `apps/web/.env.local` (from `.env.example`): Giscus, Keystatic, `NEXT_PUBLIC_GATEWAY_URL`.
- MCP client env: `API_URL`, `API_KEY`, `TTS_OUTPUT_DIR` (see `.mcp.json`).
