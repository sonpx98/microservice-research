# Design Tokens, Themes and Layout Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the portfolio one visual identity built only from theme tokens, shared layout templates, and themes that each app (or section) opts into, after removing outdated content and merging Algo Verse into the Knowledge Graph.

**Architecture:** A workspace package `packages/theme` holds plain CSS custom properties: one token contract (semantic names) and theme blocks selected by `data-theme` plus the `.dark` mode class. `apps/web` maps the contract into Tailwind v4 with a single `@theme inline` block, so components only ever write token utilities (`bg-card`, `text-muted-foreground`). `apps/practice-hub` imports the same CSS and aliases its existing variables to the contract. A `lint:tokens` script fails on raw palette classes, arbitrary hex values and inline colors.

**Tech Stack:** Next.js 16, Tailwind CSS v4 (`@theme inline`), next-themes (`.dark`), next/font (Geist, Geist Mono), reactflow, Vite (practice-hub), pnpm workspace.

**Branch:** `feature/design-tokens` off `develop`, ff-merged into `develop` when done.

**Gate after every task:** from `apps/web`: `rm -rf .next && pnpm type-check`, `KEYSTATIC_GITHUB_CLIENT_ID=x KEYSTATIC_GITHUB_CLIENT_SECRET=x KEYSTATIC_SECRET=x pnpm build`, `pnpm lint`. From Task 6 on, also `pnpm lint:tokens` on the migrated scope. No automated browser check (user rule); the user reviews visuals.

---

## Decisions (confirmed with the user, 2026-10-09)

| Question | Decision |
|---|---|
| Content | Delete all 9 blog posts and all 7 knowledge-graph notes. Keep schemas; pages show empty states. |
| CV generator | Delete, including its dependencies. |
| Scope of "unify apps" | Delegated. Shared theme package; each app/section picks a theme via `data-theme`. Web = `blueprint`, playground section + practice-hub = `terminal`. |
| Look | New identity (direction below, chosen by the assistant; all values live in one file so they are cheap to change). |

## Visual direction

**Blueprint** (default, web): an engineering notebook. Cool paper-white surfaces in light mode, deep ink-navy in dark mode, one cobalt accent, an amber "annotation" highlight. Geist for text, Geist Mono for labels, metadata and nav, so the site reads like a technical document. Tighter radius (6px) for a crisp, drafted feel. A dotted grid surface for the graph canvas.

**Terminal** (playground section, practice-hub): always dark, near-black surfaces, signal-green primary, amber warnings. Fits the security labs and the chat app.

## Token contract

Every theme defines every name below. Components use only these (as Tailwind utilities).

| Group | Tokens |
|---|---|
| Surfaces | `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `muted`, `muted-foreground` |
| Actions | `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `ring` |
| Lines | `border`, `input` |
| Status | `success`, `success-foreground`, `warning`, `warning-foreground`, `danger`, `danger-foreground`, `info`, `info-foreground` (`destructive` aliases `danger` for shadcn primitives) |
| Categorical | `chart-1` … `chart-5` (graph node types, memory regions: stack, heap, register, output) |
| Shape | `radius` |
| Type | `font-sans`, `font-mono` |

Opacity variants come from Tailwind (`bg-danger/10`), never from new tokens.

## File structure

| Path | Responsibility |
|---|---|
| `packages/theme/package.json` | Workspace package `theme`, exports `theme.css` |
| `packages/theme/theme.css` | Token contract values: `blueprint` light, `blueprint` dark, `terminal` |
| `apps/web/src/app/globals.css` | Imports theme, one `@theme inline` mapping, base styles via tokens only, `bg-grid` utility, prose and code-block styling via tokens |
| `apps/web/src/components/layout/page-shell.tsx` | Standard page: eyebrow, title, description, actions, width |
| `apps/web/src/components/layout/full-bleed-page.tsx` | Header + full-height body (graph, visualizer) |
| `apps/web/src/components/layout/article-layout.tsx` | Long-form reading column |
| `apps/web/src/components/layout/index.ts` | Barrel |
| `apps/web/scripts/lint-tokens.mjs` | Fails on raw palette classes, arbitrary hex, inline colors |
| `apps/web/scripts/tokenize.mjs` | One-off codemod for common light/dark pairs (deleted after migration) |
| `apps/practice-hub/src/styles.css` | `:root` aliases its variables to the contract |

---

### Task 1: Delete outdated content and the CV generator

**Files:**
- Delete: `apps/web/content/posts/**`, `apps/web/content/knowledge-graph/**`
- Delete: `apps/web/src/app/[locale]/tools/cv-generator/`, `apps/web/src/components/cv/`, `apps/web/src/lib/cv/`
- Modify: `apps/web/package.json` (remove `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@monaco-editor/react`, `remark-parse`, `unified`)
- Modify: `apps/web/next.config.mjs` (drop the Monaco-only CSP origins `https://cdn.jsdelivr.net` from script/style/connect/worker-src and their comments)

- [ ] **Step 1: Delete**

```bash
cd ~/work/microservice-research
git rm -rq apps/web/content/posts apps/web/content/knowledge-graph
git rm -rq "apps/web/src/app/[locale]/tools/cv-generator" apps/web/src/components/cv apps/web/src/lib/cv
pnpm --filter web remove @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @monaco-editor/react remark-parse unified
```

Before removing a dependency, confirm it has no remaining importer:

```bash
grep -rn "@monaco-editor\|@dnd-kit\|from 'unified'\|remark-parse" apps/web/src
```

Expected: no output.

- [ ] **Step 2: Keep the content folders so contentlayer still finds its globs**

```bash
mkdir -p apps/web/content/posts/en apps/web/content/posts/vi apps/web/content/knowledge-graph/en
touch apps/web/content/posts/en/.gitkeep apps/web/content/posts/vi/.gitkeep apps/web/content/knowledge-graph/en/.gitkeep
```

- [ ] **Step 3: Run the gate.** Zero documents must build: blog index, explore, `[slug]` static params (empty array), home featured section, knowledge graph. Fix any `posts[0]`-style access or empty `generateStaticParams` failure by returning `[]` and rendering `EmptyState` from `@/components/ui/empty-state`.

- [ ] **Step 4: Commit** `chore(web): remove outdated posts, knowledge notes and cv generator`

### Task 2: Merge Algo Verse into the Knowledge Graph

**Files:**
- Modify: `apps/web/contentlayer.config.*` (KnowledgeGraphNode: add optional `visualize: { type: 'string' }`, an example id from `src/lib/algo-verse/examples.ts`)
- Modify: `apps/web/src/components/algo-verse/memory-visualizer.tsx` (accept `initialExampleId?: string`)
- Modify: `apps/web/src/app/[locale]/knowledge-graph/page.tsx` (two views: `graph` and `visualizer`, picked by `?view=`; `?example=` preselects)
- Modify: `apps/web/src/components/knowledge-graph/NodeDetail.tsx` (link "Run in visualizer" when `node.visualize` is set)
- Delete: `apps/web/src/app/[locale]/algo-verse/`
- Modify: `apps/web/next.config.mjs` (permanent redirect `/:locale/algo-verse` → `/:locale/knowledge-graph?view=visualizer`)
- Modify: `apps/web/src/components/header.tsx` (nav: Blog, Knowledge Graph, Playground)

- [ ] **Step 1: Visualizer prop**

```tsx
export function MemoryVisualizer({ initialExampleId }: { initialExampleId?: string }) {
  const [code, setCode] = useState(
    () => (initialExampleId && getExampleById(initialExampleId)?.code) || codeExamples[0].code,
  );
```

Import `getExampleById` alongside `codeExamples`. The page passes `key={example}` so a new example remounts instead of syncing state in an effect.

- [ ] **Step 2: Page with two views** (server component reading `searchParams`; the graph view stays the client `KnowledgeGraphView`)

```tsx
type View = 'graph' | 'visualizer';

export default async function KnowledgeGraphPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; example?: string }>;
}) {
  const { locale } = await params;
  const { view, example } = await searchParams;
  const active: View = view === 'visualizer' ? 'visualizer' : 'graph';
  // render FullBleedPage (Task 4) with a two-link segmented switch:
  //   /${locale}/knowledge-graph            -> graph
  //   /${locale}/knowledge-graph?view=visualizer -> visualizer
  // body: active === 'graph'
  //   ? <KnowledgeGraphView nodes={getKnowledgeGraphNodes()} />
  //   : <MemoryVisualizer key={example ?? 'default'} initialExampleId={example} />
}
```

Until Task 4 lands, use the existing header markup; Task 4 swaps it to `FullBleedPage`.

- [ ] **Step 3: NodeDetail link**

```tsx
{node.visualize && (
  <Link href={`?view=visualizer&example=${node.visualize}`} className="...">
    Run in visualizer
  </Link>
)}
```

- [ ] **Step 4: Remove the route, add the redirect, trim nav**

```js
async redirects() {
  return [
    { source: '/:locale/algo-verse', destination: '/:locale/knowledge-graph?view=visualizer', permanent: true },
  ];
},
```

- [ ] **Step 5: Gate, then commit** `feat(web): merge algo-verse into the knowledge graph`

### Task 3: Theme package and token foundation

**Files:**
- Create: `packages/theme/package.json`, `packages/theme/theme.css`
- Modify: `pnpm-workspace.yaml` (add `packages/*`)
- Modify: `apps/web/package.json` (`"theme": "workspace:*"`)
- Rewrite: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/[locale]/layout.tsx` (Geist fonts via `next/font/google`, `body` uses `bg-background text-foreground font-sans`)

- [ ] **Step 1: Package**

```json
{
  "name": "theme",
  "private": true,
  "version": "1.0.0",
  "exports": { "./theme.css": "./theme.css" }
}
```

- [ ] **Step 2: `theme.css`** (values are the identity; names are the contract)

```css
/* Token contract. Every theme block defines every token. Values are oklch. */
:root,
[data-theme="blueprint"] {
  --background: oklch(0.985 0.004 250);
  --foreground: oklch(0.22 0.03 260);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--foreground);
  --muted: oklch(0.955 0.008 250);
  --muted-foreground: oklch(0.5 0.025 255);
  --primary: oklch(0.52 0.17 258);
  --primary-foreground: oklch(0.985 0.004 250);
  --secondary: oklch(0.93 0.015 255);
  --secondary-foreground: oklch(0.28 0.04 260);
  --accent: oklch(0.82 0.13 80);
  --accent-foreground: oklch(0.25 0.05 70);
  --ring: oklch(0.52 0.17 258);
  --border: oklch(0.9 0.012 250);
  --input: oklch(0.88 0.014 250);
  --success: oklch(0.58 0.14 155);
  --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.75 0.15 75);
  --warning-foreground: oklch(0.25 0.05 70);
  --danger: oklch(0.58 0.2 27);
  --danger-foreground: oklch(0.985 0 0);
  --info: oklch(0.6 0.12 230);
  --info-foreground: oklch(0.985 0 0);
  --chart-1: oklch(0.52 0.17 258);
  --chart-2: oklch(0.65 0.15 160);
  --chart-3: oklch(0.72 0.15 75);
  --chart-4: oklch(0.6 0.2 330);
  --chart-5: oklch(0.6 0.12 210);
  --radius: 0.375rem;
}

.dark,
.dark [data-theme="blueprint"] {
  --background: oklch(0.17 0.02 260);
  --foreground: oklch(0.94 0.008 250);
  --card: oklch(0.21 0.025 260);
  --card-foreground: var(--foreground);
  --popover: oklch(0.21 0.025 260);
  --popover-foreground: var(--foreground);
  --muted: oklch(0.24 0.025 260);
  --muted-foreground: oklch(0.7 0.02 255);
  --primary: oklch(0.72 0.14 252);
  --primary-foreground: oklch(0.17 0.02 260);
  --secondary: oklch(0.27 0.03 260);
  --secondary-foreground: oklch(0.92 0.01 250);
  --accent: oklch(0.8 0.13 80);
  --accent-foreground: oklch(0.2 0.03 70);
  --ring: oklch(0.72 0.14 252);
  --border: oklch(0.3 0.025 260);
  --input: oklch(0.32 0.025 260);
  --success: oklch(0.72 0.15 155);
  --success-foreground: oklch(0.17 0.02 260);
  --warning: oklch(0.8 0.14 80);
  --warning-foreground: oklch(0.2 0.03 70);
  --danger: oklch(0.68 0.19 25);
  --danger-foreground: oklch(0.17 0.02 260);
  --info: oklch(0.72 0.11 230);
  --info-foreground: oklch(0.17 0.02 260);
  --chart-1: oklch(0.72 0.14 252);
  --chart-2: oklch(0.75 0.14 160);
  --chart-3: oklch(0.8 0.14 80);
  --chart-4: oklch(0.72 0.18 330);
  --chart-5: oklch(0.74 0.11 210);
}

/* Terminal: always dark, regardless of the page mode. */
[data-theme="terminal"],
.dark [data-theme="terminal"] {
  --background: oklch(0.15 0.008 160);
  --foreground: oklch(0.92 0.02 150);
  --card: oklch(0.19 0.01 160);
  --card-foreground: var(--foreground);
  --popover: oklch(0.19 0.01 160);
  --popover-foreground: var(--foreground);
  --muted: oklch(0.22 0.012 160);
  --muted-foreground: oklch(0.65 0.03 150);
  --primary: oklch(0.8 0.18 150);
  --primary-foreground: oklch(0.15 0.008 160);
  --secondary: oklch(0.25 0.015 160);
  --secondary-foreground: oklch(0.9 0.02 150);
  --accent: oklch(0.82 0.15 80);
  --accent-foreground: oklch(0.15 0.008 160);
  --ring: oklch(0.8 0.18 150);
  --border: oklch(0.28 0.015 160);
  --input: oklch(0.3 0.015 160);
  --success: oklch(0.8 0.18 150);
  --success-foreground: oklch(0.15 0.008 160);
  --warning: oklch(0.82 0.15 80);
  --warning-foreground: oklch(0.15 0.008 160);
  --danger: oklch(0.7 0.19 25);
  --danger-foreground: oklch(0.15 0.008 160);
  --info: oklch(0.75 0.12 210);
  --info-foreground: oklch(0.15 0.008 160);
  --chart-1: oklch(0.8 0.18 150);
  --chart-2: oklch(0.75 0.12 210);
  --chart-3: oklch(0.82 0.15 80);
  --chart-4: oklch(0.72 0.18 330);
  --chart-5: oklch(0.7 0.19 25);
  --radius: 0.25rem;
  color-scheme: dark;
}
```

- [ ] **Step 3: `globals.css`**: remove both old `@theme` blocks and the old `:root`/`.dark` variable blocks. Keep: tailwind, tw-animate, typography imports, `@custom-variant dark`. Add `@import "theme/theme.css";` and one mapping:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* … one line per contract color token … */
  --color-destructive: var(--danger);
  --color-destructive-foreground: var(--danger-foreground);
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
  --radius-xl: calc(var(--radius) + 6px);
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
```

Base layer: `html { background-color: var(--background) }` (replaces hardcoded hex flash guard), `body { @apply bg-background text-foreground font-sans }`, code-block borders `var(--border)`, highlighted line `color-mix(in oklch, var(--primary) 10%, transparent)` with `border-left-color: var(--primary)`, inline code `bg-muted`. Utility:

```css
@utility bg-grid {
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

- [ ] **Step 4: Fonts** in `[locale]/layout.tsx`:

```tsx
import { Geist, Geist_Mono } from 'next/font/google';
const sans = Geist({ subsets: ['latin', 'vietnamese'], variable: '--font-geist-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
// <html className={`${sans.variable} ${mono.variable}`} …>
// <body className="h-dvh overflow-hidden bg-background text-foreground font-sans antialiased">
```

If `Geist` has no `vietnamese` subset, drop it and keep `latin`; the system fallback covers the rest.

- [ ] **Step 5: Gate, commit** `feat(theme): add shared theme package and token foundation`

### Task 4: Layout templates

**Files:** create `apps/web/src/components/layout/{page-shell,full-bleed-page,article-layout,index}.tsx|ts`.

- [ ] **Step 1: PageShell**

```tsx
import { cn } from '@/lib/utils';

type Width = 'prose' | 'wide';
const widths: Record<Width, string> = { prose: 'max-w-3xl', wide: 'max-w-6xl' };

export function PageHeader({
  eyebrow, title, description, actions,
}: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function PageShell({
  width = 'wide', className, children, ...header
}: React.ComponentProps<typeof PageHeader> & { width?: Width; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mx-auto w-full px-4 py-12 sm:px-6', widths[width], className)}>
      <PageHeader {...header} />
      <div className="pt-8">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: FullBleedPage** (header bar + `flex-1 min-h-0` body; `bodyClassName` lets the graph add `bg-grid`)

```tsx
export function FullBleedPage({
  bodyClassName, children, ...header
}: React.ComponentProps<typeof PageHeader> & { bodyClassName?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6"><PageHeader {...header} /></div>
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: ArticleLayout** (meta row in mono, title, `prose` column using typography plugin themed by tokens)

```tsx
export function ArticleLayout({
  meta, title, children,
}: { meta?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {meta && <div className="mb-4 flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">{meta}</div>}
      <h1 className="mb-8 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
        {children}
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Gate, commit** `feat(web): add page, full-bleed and article layout templates`

### Task 5: Migrate areas to tokens and templates

Order (one commit each, gate between): `components/ui` → layout chrome (`header`, `theme-toggle`, `language-switcher`, `[locale]/page.tsx`, `components/home`) → blog (`app/[locale]/blog/**`, `components/blog`, `mdx-*`) → knowledge graph + algo-verse → playground (wrap section layout in `data-theme="terminal"`) → english-learning.

- [ ] **Step 1: Codemod** `apps/web/scripts/tokenize.mjs` rewrites the common pairs first; it only touches whole pairs so no dead `dark:` duplicates remain. Run per area: `node scripts/tokenize.mjs <dir>`.

```js
#!/usr/bin/env node
// One-off: collapse common light/dark palette pairs into tokens. Delete after migration.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PAIRS = [
  ['bg-white dark:bg-gray-950', 'bg-background'],
  ['bg-white dark:bg-gray-900', 'bg-card'],
  ['bg-white dark:bg-gray-800', 'bg-card'],
  ['bg-gray-50 dark:bg-gray-900', 'bg-muted'],
  ['bg-gray-50 dark:bg-gray-800', 'bg-muted'],
  ['bg-gray-100 dark:bg-gray-800', 'bg-muted'],
  ['text-gray-900 dark:text-white', 'text-foreground'],
  ['text-gray-900 dark:text-gray-100', 'text-foreground'],
  ['text-gray-900 dark:text-gray-50', 'text-foreground'],
  ['text-gray-800 dark:text-gray-200', 'text-foreground'],
  ['text-gray-700 dark:text-gray-300', 'text-foreground'],
  ['text-gray-600 dark:text-gray-400', 'text-muted-foreground'],
  ['text-gray-500 dark:text-gray-400', 'text-muted-foreground'],
  ['border-gray-200 dark:border-gray-800', 'border-border'],
  ['border-gray-200 dark:border-gray-700', 'border-border'],
  ['border-gray-300 dark:border-gray-700', 'border-input'],
  ['text-blue-600 dark:text-blue-400', 'text-primary'],
  ['bg-blue-600 hover:bg-blue-700', 'bg-primary hover:bg-primary/90'],
  ['hover:bg-gray-100 dark:hover:bg-gray-800', 'hover:bg-muted'],
  ['hover:text-gray-900 dark:hover:text-white', 'hover:text-foreground'],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk(process.argv[2])) {
  let src = readFileSync(file, 'utf8');
  const before = src;
  for (const [from, to] of PAIRS) src = src.split(from).join(to);
  if (src !== before) { writeFileSync(file, src); changed++; }
}
console.log(`tokenized ${changed} file(s)`);
```

- [ ] **Step 2: Manual pass per area** using the mapping: neutral grays → `foreground`/`muted-foreground`/`muted`/`card`/`border`; brand blue/indigo/purple → `primary` or `accent`; red → `danger`; green → `success`; yellow/amber/orange → `warning`; cyan/sky → `info`; category colors (node types, stack/heap/register) → `chart-1..5`; `bg-white/10` style overlays on dark cards → `bg-foreground/10`. Gradients become a solid token surface (no new gradient tokens). Swap ad-hoc page headers for `PageShell`/`FullBleedPage`/`ArticleLayout`.

- [ ] **Step 3: Code-side colors.** `getNodeColor` in `src/lib/knowledge-graph.ts` and any reactflow `style` colors return `var(--chart-n)` strings instead of hex, so they follow the theme without JS reading computed styles.

- [ ] **Step 4: Per area, gate + `node scripts/lint-tokens.mjs <area>` = 0, then commit** `refactor(web): tokenize <area>`

### Task 6: Token guard

**Files:** create `apps/web/scripts/lint-tokens.mjs`; modify `apps/web/package.json` (`"lint:tokens": "node scripts/lint-tokens.mjs src"`, and chain it into `lint`).

- [ ] **Step 1: Script**

```js
#!/usr/bin/env node
// Fails when components use colors outside the theme tokens.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const RULES = [
  ['raw palette class', new RegExp(`\\b(?:[a-z-]+:)*(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|placeholder|shadow|decoration|caret|accent)-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?\\b`, 'g')],
  ['arbitrary color', /\b[a-z-]+-\[(?:#|rgb|hsl|oklch)[^\]]*\]/g],
  ['inline color', /style=\{\{[^}]*\b(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*['"`](?!var\()/g],
  ['hex literal', /['"`]#[0-9a-fA-F]{3,8}['"`]/g],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(p)) out.push(p);
  }
  return out;
}

let hits = 0;
for (const file of walk(process.argv[2] ?? 'src')) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [label, re] of RULES) {
      for (const m of line.matchAll(re)) {
        hits++;
        console.log(`${file}:${i + 1}  ${label}: ${m[0]}`);
      }
    }
  });
}
if (hits) { console.error(`\n${hits} token violation(s)`); process.exit(1); }
console.log('tokens: clean');
```

- [ ] **Step 2: Sanity check the guard catches a violation**

```bash
cd apps/web
printf 'export const X = () => <div className="bg-gray-100" />;\n' > /tmp/tok-probe.tsx
mkdir -p /tmp/tok && mv /tmp/tok-probe.tsx /tmp/tok/
node scripts/lint-tokens.mjs /tmp/tok; echo "exit=$?"
```

Expected: one `raw palette class: bg-gray-100` line and `exit=1`.

- [ ] **Step 3: Run on `src` after Task 5**: expected `tokens: clean`, exit 0. Delete `scripts/tokenize.mjs`.

- [ ] **Step 4: Commit** `chore(web): enforce theme tokens with lint:tokens`

### Task 7: practice-hub adopts the terminal theme

**Files:** modify `apps/practice-hub/package.json` (`"theme": "workspace:*"`), `apps/practice-hub/src/main.tsx` (`import "theme/theme.css";` before `./styles.css`), `apps/practice-hub/index.html` (`<html data-theme="terminal">`), `apps/practice-hub/src/styles.css` (`:root` aliases).

- [ ] **Step 1: Alias the hub variables**

```css
:root {
  --bg: var(--background);
  --panel: var(--card);
  --panel-2: var(--muted);
  --border: var(--border);
  --text: var(--foreground);
  --muted: var(--muted-foreground);
  --accent: var(--primary);
  --accent-ink: var(--primary-foreground);
  --ok: var(--success);
  --warn: var(--warning);
  --danger: var(--danger);
  --radius: var(--radius);
}
```

Self-references (`--border`, `--danger`, `--radius`) are cyclic: drop those three lines, the contract already defines them with the same names. `--muted` collides with the contract's surface `--muted`: rename the hub's text use of `var(--muted)` to `var(--muted-foreground)` and `var(--panel-2)` stays an alias of `--muted`.

- [ ] **Step 2: Gate:** `pnpm --filter practice-hub typecheck && pnpm --filter practice-hub test && pnpm --filter practice-hub build`.

- [ ] **Step 3: Commit** `feat(hub): use the shared terminal theme`

### Task 8: Docs and rules

- [ ] Update `CLAUDE.md`: layout row for `packages/theme`; rules "colors only via theme tokens, `pnpm --filter web lint:tokens` must pass", "pages use `PageShell`/`FullBleedPage`/`ArticleLayout`", "a new theme = a new block in `packages/theme/theme.css` defining every contract token", practice-hub now shares the theme package; nav = 3 pillars.
- [ ] Update `readme.md` layout block.
- [ ] Commit `docs: document theme tokens and layout templates`, ff-merge `feature/design-tokens` into `develop`, push.
