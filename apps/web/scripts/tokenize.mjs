#!/usr/bin/env node
// One-off migration: rewrite Tailwind palette classes to theme tokens. Delete after migration.
// Usage: node scripts/tokenize.mjs <file|dir> [--dry]
// Unmapped classes are left alone; scripts/lint-tokens.mjs reports them for the manual pass.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NEUTRAL = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone']);
const FAMILY = {
  blue: 'primary', indigo: 'primary', violet: 'primary', purple: 'primary',
  red: 'danger', rose: 'danger',
  green: 'success', emerald: 'success', lime: 'success', teal: 'success',
  yellow: 'warning', amber: 'warning', orange: 'warning',
  cyan: 'info', sky: 'info',
  pink: 'chart-4', fuchsia: 'chart-4',
};
const PALETTE = [...NEUTRAL, ...Object.keys(FAMILY), 'white', 'black'].join('|');
const CLASS = new RegExp(
  `(?<![\\w-])((?:[a-z-]+:)*)(bg|text|border|ring|divide|placeholder)-(${PALETTE})(?:-(\\d{2,3}))?(?:\\/(\\d+))?(?![\\w-])`,
  'g',
);

function neutral(util, shade, variants) {
  const hover = variants.includes('hover:');
  if (util === 'bg') {
    if (shade === undefined) return 'bg-card'; // white
    if (hover) return shade <= 100 ? 'bg-muted' : 'bg-accent';
    if (shade <= 100) return 'bg-muted';
    if (shade <= 300) return 'bg-border'; // dividers, tracks, skeleton bars
    return null; // dark surfaces need a human decision
  }
  if (util === 'placeholder') return 'placeholder:text-muted-foreground'; // v3 syntax, invalid in v4
  if (util === 'text') {
    if (shade === undefined) return null; // text-white: handled by context
    if (hover) return 'text-foreground'; // hover always moves toward full contrast
    return shade >= 700 ? 'text-foreground' : 'text-muted-foreground';
  }
  if (util === 'border' || util === 'divide') return shade >= 300 ? `${util}-input` : `${util}-border`;
  if (util === 'ring') return 'ring-ring';
  return null;
}

function chromatic(util, tok, shade, alpha, variants) {
  if (util === 'bg') {
    if (shade <= 100) return `bg-${tok}/10`;
    if (shade <= 200) return `bg-${tok}/20`;
    if (variants.includes('hover:')) return `bg-${tok}/90`; // solid hover = slightly lighter
    return alpha ? `bg-${tok}/${alpha}` : `bg-${tok}`;
  }
  if (util === 'text') return shade <= 300 ? `text-${tok}-foreground` : `text-${tok}`;
  if (util === 'border' || util === 'divide') return shade <= 300 ? `${util}-${tok}/30` : `${util}-${tok}`;
  if (util === 'ring') return `ring-${tok}`;
  return null;
}

function foregroundFor(line) {
  if (/\bbg-(?:red|rose|danger|destructive)\b|bg-(?:red|rose)-[5-9]/.test(line)) return 'text-danger-foreground';
  if (/\bbg-(?:green|emerald|success)\b|bg-(?:green|emerald)-[5-9]/.test(line)) return 'text-success-foreground';
  if (/\bbg-(?:yellow|amber|orange|warning)\b|bg-(?:yellow|amber|orange)-[5-9]/.test(line)) return 'text-warning-foreground';
  return 'text-primary-foreground';
}

function mapClass(variants, util, hue, shadeStr, alpha, line) {
  const shade = shadeStr === undefined ? undefined : Number(shadeStr);
  if (hue === 'white' && util === 'text') return foregroundFor(line);
  if (hue === 'white' && util === 'bg') return alpha ? `bg-card/${alpha}` : 'bg-card';
  if (hue === 'white' || hue === 'black') return null;
  if (NEUTRAL.has(hue)) return neutral(util, shade, variants);
  return chromatic(util, FAMILY[hue], shade, alpha, variants);
}

function rewriteLine(line) {
  const mapped = new Set(); // "<variants-without-dark><util>" already tokenized on this line
  let out = line.replace(CLASS, (m, variants, util, hue, shade, alpha) => {
    if (variants.includes('dark:')) return m; // second pass
    const tok = mapClass(variants, util, hue, shade, alpha, line);
    if (!tok) return m;
    mapped.add(variants + util);
    return tok.includes(':') ? tok : variants + tok;
  });
  // Dark counterparts are redundant once the light class is a token: tokens switch with .dark.
  out = out.replace(CLASS, (m, variants, util) => {
    if (!variants.includes('dark:')) return m;
    return mapped.has(variants.replace('dark:', '') + util) ? '\u0000' : m;
  });
  return out.replace(/ ?\u0000/g, '').replace(/\u0000 ?/g, '');
}

function walk(p, out = []) {
  if (statSync(p).isFile()) {
    if (/\.tsx?$/.test(p)) out.push(p);
  } else for (const n of readdirSync(p)) walk(join(p, n), out);
  return out;
}

const [target, flag] = process.argv.slice(2);
let files = 0;
for (const f of walk(target)) {
  const src = readFileSync(f, 'utf8');
  const next = src.split('\n').map(rewriteLine).join('\n');
  if (next !== src) {
    files++;
    if (flag !== '--dry') writeFileSync(f, next);
  }
}
console.log(`${flag === '--dry' ? 'would tokenize' : 'tokenized'} ${files} file(s) under ${target}`);
