#!/usr/bin/env node
/**
 * Reports raw and gzip sizes for everything Vite emitted into dist/.
 * Run via `npm run perf` (builds first). Output is meant to be pasted
 * into docs/perf-baseline.md and diffed stage-to-stage.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = join(process.cwd(), 'dist');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const kib = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

const files = walk(dist)
  .map((path) => {
    const raw = readFileSync(path);
    return {
      file: relative(dist, path),
      bytes: raw.byteLength,
      gzip: gzipSync(raw, { level: 9 }).byteLength,
    };
  })
  .sort((a, b) => b.bytes - a.bytes);

if (files.length === 0) {
  console.error('dist/ is empty — run `npm run build` first.');
  process.exit(1);
}

const fileWidth = Math.max(...files.map((f) => f.file.length), 'file'.length);
console.log(`${'file'.padEnd(fileWidth)}  ${'raw'.padStart(10)}  ${'gzip'.padStart(10)}`);
for (const f of files) {
  console.log(
    `${f.file.padEnd(fileWidth)}  ${kib(f.bytes).padStart(10)}  ${kib(f.gzip).padStart(10)}`,
  );
}

const total = files.reduce(
  (acc, f) => ({ bytes: acc.bytes + f.bytes, gzip: acc.gzip + f.gzip }),
  { bytes: 0, gzip: 0 },
);
console.log('-'.repeat(fileWidth + 24));
console.log(
  `${'TOTAL'.padEnd(fileWidth)}  ${kib(total.bytes).padStart(10)}  ${kib(total.gzip).padStart(10)}  (${files.length} files)`,
);

// Heuristic split: JS/CSS critical path vs static assets (fonts/images).
const critical = files.filter((f) => /\.(js|css|html)$/.test(f.file));
const critTotal = critical.reduce((acc, f) => acc + f.gzip, 0);
console.log(`critical path (js+css+html, gzip): ${kib(critTotal)}`);

// Report anything stale or suspicious: source maps or files > 200 KiB raw.
const heavy = files.filter((f) => f.bytes > 204_800);
if (heavy.length > 0) {
  console.log(`\nfiles over 200 KiB raw:`);
  for (const f of heavy) console.log(`  ${f.file}: ${kib(f.bytes)}`);
}
const maps = files.filter((f) => f.file.endsWith('.map'));
if (maps.length > 0) {
  console.log(`\nwarning: ${maps.length} source map(s) emitted into dist/`);
}
