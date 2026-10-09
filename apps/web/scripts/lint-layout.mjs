#!/usr/bin/env node
// Fails when pages/features bypass the layout kit (components/layout) or the ui primitives (components/ui).
// Usage: node scripts/lint-layout.mjs [dir ...]   (default: src)
// Escape hatch for a real exception: put `layout-exempt: <reason>` in a comment on the same line.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

const KIT = [`${sep}components${sep}ui${sep}`, `${sep}components${sep}layout${sep}`];

// Class rules scan everything (classNames are often template literals).
const CLASS_RULES = [
  ['ad-hoc page width (templates own widths)', /(?<![\w-])(?:container|max-w-(?:4xl|5xl|7xl))(?![\w-])/g],
  ['radius off-scale (use rounded-lg / -md / -full)', /(?<![\w-])(?:[\w-]+:)*rounded-(?:xl|2xl|3xl)(?![\w-])/g],
  ['surface shadow (surfaces use a border)', /(?<![\w-])(?:[\w-]+:)*shadow-(?:md|lg|xl|2xl)(?![\w-])/g],
  ['hand-rolled overlay (use ui/dialog)', /(?<![\w-])fixed inset-0(?![\w-])/g],
];
// Element rules skip template-literal bodies: lab payloads are raw HTML strings, not JSX.
const ELEMENT_RULES = [
  ['raw <button> (use ui/button)', /<button\b/g],
  ['raw <input> (use ui/input)', /<input\b/g],
  ['raw <textarea> (use ui/textarea)', /<textarea\b/g],
];

const blankTemplates = (src) =>
  src.replace(/`(?:\\.|[^`\\])*`/g, (m) => m.replace(/[^\n]/g, ' '));

function walk(path, out = []) {
  if (statSync(path).isFile()) {
    if (/\.tsx$/.test(path)) out.push(path);
  } else {
    for (const name of readdirSync(path)) walk(join(path, name), out);
  }
  return out;
}

const roots = process.argv.slice(2);
let hits = 0;
for (const file of (roots.length ? roots : ['src']).flatMap((r) => walk(r))) {
  if (KIT.some((k) => file.includes(k))) continue;
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const jsxLines = blankTemplates(src).split('\n');
  lines.forEach((line, i) => {
    if (line.includes('layout-exempt:')) return;
    for (const [rules, text] of [[CLASS_RULES, line], [ELEMENT_RULES, jsxLines[i]]]) {
      for (const [label, re] of rules) {
        for (const m of text.matchAll(re)) {
          hits++;
          console.log(`${file}:${i + 1}  ${label}: ${m[0]}`);
        }
      }
    }
  });
}

if (hits) {
  console.error(`\n${hits} layout violation(s)`);
  process.exit(1);
}
console.log('layout: clean');
