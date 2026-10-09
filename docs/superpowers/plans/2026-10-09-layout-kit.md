# Layout Kit Implementation Plan

> **For agentic workers:** executed inline (user preference: no long subagents). Steps use checkbox syntax.

**Goal:** Every page is assembled from one set of templates and primitives, so widths, radius, spacing, headings, buttons, inputs and dialogs look the same everywhere, and a lint rule keeps it that way.

**Branch:** `feature/layout-kit` off `develop`. Gate per commit: web `type-check`, `build` (dummy `KEYSTATIC_*`), `lint` (eslint + tokens + layout).

## Audit (2026-10-09, `apps/web/src`, excluding `ui/` and `layout/`)

| Item | Found |
|---|---|
| Pages off-template | 4 playground labs, `blog/explore/[id]` |
| Content widths | 7 (`3xl`…`7xl`) plus `container` |
| Radius | `lg` 89, `rounded` 48, `xl` 43, `md` 12, `2xl` 5 |
| Section heading styles | 14 distinct class sets |
| Buttons | 77 raw `<button>`, 15 `<Button>` |
| Inputs | 15 raw `<input>`, 4 `<textarea>`; `Input` used once |
| Overlays | 7 hand-rolled `fixed inset-0`; `Dialog` unused |
| Lab duplicates | LevelSelector x4, SuccessModal x4, AttemptsHistory x3, AlertModal x2 |

## Scale

| Axis | Rule |
|---|---|
| Width | `prose` (max-w-3xl) and `wide` (max-w-6xl) only, set by templates; full-bleed via `FullBleedPage` |
| Radius | surfaces `rounded-lg`; controls `rounded-md`; pills/avatars `rounded-full`; inline code/kbd `rounded` |
| Elevation | surfaces use a border, no shadow; only overlays (dialog, popover, dropdown) cast `shadow-lg` |
| Headings | page `h1` (PageHeader), section `h2` (Section), panel `h3` (Panel) |
| Spacing | panel padding `p-4` (sm) or `p-6` (md); stacks `gap-4` / `space-y-6` |

## Tiers

1. **Page templates** (`components/layout`): existing `PageShell`, `FullBleedPage`, `ArticleLayout`, `ViewSwitch`; new `LabShell` (back link + header + level sidebar + main). `blog/explore/[id]` moves to `ArticleLayout`.
2. **Blocks** (`components/layout`): `Section` (h2 + description + actions), `Panel` (the one surface; optional h3 header), `Callout` (tone: primary/info/success/warning/danger).
3. **Primitives** (`components/ui`): all buttons via `Button`, inputs via `Input` / new `Textarea`, overlays via `Dialog`. `Card` restyled to the surface rule (rounded-lg, no shadow).
4. **Lab kit** (`app/[locale]/playground/_kit`): one `LevelSelector` (optional solution), `SuccessPanel` (optional prevention tips), `AttemptsHistory` (normalized items), `AlertDialog` (Dialog-based). Per-lab copies are deleted.

## Guard

`apps/web/scripts/lint-layout.mjs`, chained into `pnpm lint`. Outside `components/ui` and `components/layout` it rejects: `container`, `max-w-{4,5,7}xl`, `rounded-{xl,2xl,3xl}`, `shadow-{md,lg,xl,2xl}`, raw `<button` / `<input` / `<textarea`, `fixed inset-0`. Allowed exceptions are marked inline with `// layout-exempt: <reason>` on the same line.

## Outcome

| Item | Before | After |
|---|---|---|
| Layout guard violations | 210 | 0 |
| Raw `<button>` (outside kit) | 77 | 0 |
| Hand-rolled overlays | 7 | 0 (Dialog) |
| Radius `xl`/`2xl` | 48 | 0 |
| Search implementations | 3 (one never fetched) | 1 (`SearchDialog`) |
| Lab component copies | 13 | 0 (`_kit`) |

Added beyond the plan: `Chip`/`ChipGroup`, `SearchDialog`, `Fab`/`FloatingCard`, `CodeBlock`, `ContentCard`/`Thumbnail`,
Dialog `placement="bottom"`, Panel `bodyClassName`. Dropped from the plan: `Toolbar` (a flex div). Removed: the hover
"Netflix" card overlay, `ui/search-panel`, `PostSearchModal`, `PostTagFilter`, `blog-thumbnail`.

## Order

- [x] 1. Blocks, `Textarea`, `LabShell`, `Card` restyle, guard script (not yet in `lint`).
- [x] 2. Lab kit; migrate the four labs onto `LabShell` + kit (also fixes locale-less "Back to Playground").
- [x] 3. Migrate blog, explore detail, knowledge graph, visualizer, english-learning, home and chrome until the guard is clean.
- [x] 4. Chain `lint:layout` into `lint`; document in CLAUDE.md; ff-merge into `develop`.
