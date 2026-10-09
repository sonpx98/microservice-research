#!/usr/bin/env node
// Fails when source uses colors outside the theme tokens (packages/theme/theme.css).
// Usage: node scripts/lint-tokens.mjs [dir ...]   (default: src)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const UTIL =
  'bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|outline|divide|placeholder|shadow|decoration|caret|accent';

const RULES = [
  ['raw palette class', new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${UTIL})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?(?![\\w-])`, 'g')],
  ['arbitrary color', /(?<![\w-])[\w-]+-\[(?:#|rgb|hsl|oklch|color-mix)[^\]]*\]/g],
  ['inline color', /\b(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*['"`](?!var\(|transparent|currentColor|inherit|none)[^'"`]+['"`]/g],
  ['color literal', /['"`](?:#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))['"`]/g],
  ['color attribute', /\b(?:fill|stroke|stopColor|floodColor|color)=["'](?!none|currentColor|transparent|inherit|url\()[^"']+["']/g],
  // "<token>-foreground" only exists for tokens that are surfaces in the contract.
  ['unknown token', /(?<![\w-])(?:[\w-]+:)*(?:bg|text|border|ring|fill|stroke)-(?!(?:primary|secondary|accent|muted|card|popover|highlight|overlay|success|warning|danger|info|destructive)-foreground\b)[a-z]+(?:-\d)?-foreground\b/g],
];

function walk(path, out = []) {
  if (statSync(path).isFile()) {
    if (/\.(tsx?|mjs)$/.test(path)) out.push(path);
  } else {
    for (const name of readdirSync(path)) walk(join(path, name), out);
  }
  return out;
}

const roots = process.argv.slice(2);
let hits = 0;
for (const file of (roots.length ? roots : ['src']).flatMap((r) => walk(r))) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const [label, re] of RULES) {
        for (const m of line.matchAll(re)) {
          hits++;
          console.log(`${file}:${i + 1}  ${label}: ${m[0]}`);
        }
      }
    });
}

if (hits) {
  console.error(`\n${hits} token violation(s)`);
  process.exit(1);
}
console.log('tokens: clean');
