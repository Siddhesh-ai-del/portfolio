# Performance baseline

Recorded at commit `75eeb26` (before the staged optimization plan). Every later
phase records its "after" numbers here using the same methodology.

## How to reproduce

- **Bundle**: `npm run perf` (builds, then reports raw/gzip sizes of `dist/`).
- **Lighthouse**: `npx lighthouse http://localhost:4173/ --chrome-path=/usr/bin/google-chrome-stable --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo` — once with `--preset=desktop`, once with the default (mobile) preset. Requires `npm run preview` serving `dist/` on `:4173`.
- **Scroll trace**: 6 s triangular full-page scroll (rAF-stepped `scrollTo`) with CDP
  `Performance.getMetrics` deltas around the window, a `PerformanceObserver`
  (`longtask`), and an rAF frame-gap sampler. Profiles:
  - desktop: 1440×900, CPU 1×
  - mobile: 390×844 DPR 3, touch, CPU 4× throttle

## Bundle (`npm run perf`)

| file | raw | gzip |
|---|---:|---:|
| `assets/vendor-B2zNwOLu.js` | 234.01 KiB | 73.57 KiB |
| `assets/index-DqI5E3wo.js` | 23.66 KiB | 5.64 KiB |
| `assets/index-B7OcnOIh.css` | 15.05 KiB | 4.10 KiB |
| `favicon.svg` | 9.30 KiB | 1.47 KiB |
| `index.html` | 1.55 KiB | 0.65 KiB |
| `assets/rolldown-runtime-CbXtAM7H.js` | 0.58 KiB | 0.36 KiB |
| **TOTAL** | **284.16 KiB** | **85.79 KiB** (6 files) |

Critical path (js+css+html, gzip): **84.32 KiB**. Single `manualChunks`
catch-all puts react-dom + liquid-glass + lucide into one 234 KiB vendor file.

## Lighthouse (against `vite preview`, localhost)

| category | desktop | mobile |
|---|---:|---:|
| performance | **100** | **96** |
| accessibility | 94 | 95 |
| best-practices | 96 | 100 |
| seo | 91 | 91 |

Vitals: desktop FCP 363 ms / LCP 378 ms / TBT 0 ms / CLS 0.000 —
mobile FCP 1503 ms / LCP 2773 ms / TBT 42 ms / CLS 0.016.

Failed audits:

- `color-contrast` (both): `footer#connect p.font-mono` below 4.5:1.
- `robots-txt` (both): no `/robots.txt` — SPA fallback serves index.html,
  which Lighthouse parses as malformed.
- `errors-in-console` (desktop only): `fonts.googleapis.com` unreachable from
  the sandbox (`ERR_ADDRESS_UNREACHABLE`). Disappears if fonts are self-hosted
  (Phase 2).

## 6 s full-page scroll trace

| metric | desktop 1440×900 | mobile 390×844 DPR3 4× CPU |
|---|---:|---:|
| long tasks during scroll | **0** | **0** |
| frames / dropped >20 ms | 356 / 0 | 356 / 0 |
| median / worst frame gap | 16.7 / 16.8 ms | 16.7 / 16.8 ms |
| scripting | 29 ms | 95 ms |
| style recalc | 0 ms (0 count) | 41 ms (148 count) |
| layout | 0 ms | 0 ms (1 count) |
| task total | 124 ms | 503 ms |
| paint/composite (residual) | 95 ms | 367 ms |

Load (before the scroll window): 1 long task per profile — desktop 79 ms,
mobile 61 ms (bundle exec + first glass map generation).

Note: the mobile style-recalc **count** unit was originally recorded ×1000 by
the trace harness (ms-conversion helper applied to counters): the real value is
**148 recalcs over the whole 6 s pass ≈ 0.4/frame** (41 ms total) — healthy,
attributable to reveal toggles plus scroll-driven style writes. Corrected here
in Phase 6.

## Phase → target metric map

| phase | primary target metrics | baseline |
|---|---|---|
| 1 build/bundle | critical-path gzip; vendor split; drop `lucide-react` | 84.32 KiB / single 234 KiB vendor |
| 2 fonts | mobile FCP/LCP; zero `fonts.googleapis.com` requests | FCP 1503 / LCP 2773 ms |
| 3 head/SEO | Lighthouse SEO ≥ 95 | 91 (needs robots.txt, canonical, OG) |
| 4 Nav | scripting ms during scroll; scroll re-renders | desktop 29 / mobile 95 ms |
| 5 ScrollReveal | style recalc count during scroll; reduced-motion correctness | mobile 148 count |
| 6 sections | paint/composite residual during scroll | desktop 95 / mobile 367 ms |
| 7 global CSS | task total during scroll | desktop 124 / mobile 503 ms |
| 8 assets | `dist/` file count/size; favicon | 6 files / 284 KiB raw |
| 9 a11y/CI | Lighthouse a11y ≥ 95, best-practices 100; CI green | a11y 94/95, BP 96 |

Invariants for every phase: scroll stays 60 fps with 0 dropped frames and
0 long tasks during scroll; glass pill/menu pixel diff ≈ 0; menu open stays
≤ 16.8 ms worst frame on mobile.

## Protocol correction (Phase 6)

The 6 s triangular trace above (rAF-stepped `window.scrollTo`) does **not**
traverse the page: `html { scroll-behavior: smooth }` turns every programmatic
scroll into an animation that the next frame's target cancels, so the actual
position reaches only **709 px of 7668 px (18.2 %)** — hero/focus only, 7 of
28 reveals fired. Phase-to-phase A/Bs stay valid (both sides used the same
protocol), but the absolute numbers describe the top ~18 % of the page.

Corrected protocol (used from Phase 6 on): `behavior:'instant'` steps of
70 % viewport height with 140 ms pauses, down to the bottom and back up —
every section actually becomes visible, all 28 reveals fire. Recording method
unchanged (`Performance.getMetrics` deltas, `longtask` observer, rAF gap
sampler).

### Corrected full-page scroll — numbers after Phase 5

| metric | desktop 1440×900 1× | mobile 390×844 DPR3 4× |
|---|---:|---:|
| long tasks | 0 | 0 |
| frames | ~195 | 249 |
| dropped >20 ms, first scan | 4–11 × ≈33 ms | 0 |
| dropped >20 ms, re-scan | 0 | 0 |
| median / worst gap | 16.7 / 33.4 ms | 16.7 / 16.8 ms |
| scripting | 16 ms | 32 ms |
| style recalc | 100 ms (174 count) | 81 ms (153 count) |
| task total | 342 ms | 324 ms |
| reveals fired | 28/28 | 28/28 |

Desktop first-scan hitches are first-view tile raster, not section logic:
no main-thread trace event >15 ms overlaps them, an immediate re-scan drops to
0, and forcing every reveal visible at load still leaves ~3 — Chromium defers
raster of off-screen tiles until they near the viewport. Headless software
raster explains the profile split (mobile's ~390-px-wide steps stay under one
frame even at 4× CPU; 1440-px steps don't). No fix applied.

## Phase 6 — sections: paint/composite attribution

Target: paint/composite residual during scroll (desktop 95 / mobile 367 ms
under the original protocol). DevTools tracing during the pass attributes the
residual (`task − script − recalc − layout`):

| experiment (mobile 4×, 6 s pass) | RunTask wall | conclusion |
|---|---:|---|
| baseline | 3219 ms | — |
| `.grain` hidden | 3256 ms | grain ≈ 0 (independent of d36ec2f) |
| nav + glass hidden | 734 ms | liquid glass + its scroll dispatch ≈ **76 %** — sacred |
| `scroll-behavior` off | 3460 ms | harness smooth-scroll is not the driver |

Main-thread `Paint` during the whole pass: **12 events / 5.6 ms at 4× ≈
1.4 ms real** — sections repaint nothing while scrolling (everything paints at
first view; scroll is composite). The phase's target metric has no
section-side slack to cut.

Candidates evaluated and rejected:

- `content-visibility: auto` — would move first-view paint *into* the scroll
  window (that metric's direction is already ≈ 0), risks
  `contain-intrinsic-size` scroll-anchoring jumps, and desktop first-view
  raster hitches occur either way.
- `contain: layout paint` on cards — layout runs once per pass (count 1), so
  there is nothing to contain; paint containment would clip hover shadows
  (pixel-diff risk).
- Disconnecting the reveal IntersectionObserver once drained — built and
  A/B-measured: per-element `unobserve` already stops its computes (the
  computeIntersections trace bucket is internal, not this observer; 490 vs
  500 events across control/variant — noise). Not shipped.

Instrumented during attribution: exactly one IntersectionObserver in the app
(ScrollReveal), no app rAF loops during scroll (723/6 s = harness only), and
scroll listeners = Nav (window) + the liquid-glass lib (vendor chunk, sacred).

## After-numbers — all phases (final, phase 9)

Commits: `564e07e` (0) → `d2966a9` (1) → `5601a6a` (2) → `dd70d4e` (3) →
`909e1eb` (4) → `87da4da` (5) → `2f92afb` (6 docs) → `621c4b9` (7) →
`417bbc6` (8) → `238cf6d` (9). Every phase verified before its push; every
phase independently revertible.

### Phase-by-phase

| phase | target | after (verified) |
|---|---|---|
| 1 build/bundle | critical-path gzip; vendor split; drop `lucide-react` | split live: `index` 24.00 / `vendor` 47.14 / `react` 185.12 KiB raw (5.78 / 15.57 / 57.67 gzip); critical path 84.60 KiB gzip (baseline 84.32 — the +0.28 is self-hosted `@font-face` CSS from phase 2) |
| 2 fonts | mobile FCP/LCP; zero `fonts.googleapis.com` | 0 requests to Google (network audit, phase 8); CLS **0.000** (baseline 0.016); LCP 2773 → 2.2–2.3 s; 6 faces / 3 files / 99.83 KiB, `font-display: swap` |
| 3 head/SEO | Lighthouse SEO ≥ 95 | SEO **100** desktop + mobile (baseline 91) |
| 4 Nav | scripting ms during scroll; scroll re-renders | activeRef bailout (`909e1eb`); mobile scripting 95 → ~80 ms under the legacy flawed protocol (same-protocol A/B) |
| 5 ScrollReveal | style recalc count during scroll | class + CSS-custom-prop driven (`87da4da`, A-B-A verified); count itself stays ≈148–153 — phase 6 shows the count is reveal-transition mechanics, not rule-driven |
| 6 sections | paint/composite residual | sections repaint ≈1.4 ms real during scroll; residual is liquid glass + scroll dispatch (~76 %, sacred) — no section-side slack; see attribution above |
| 7 global CSS | task total during scroll | desktop style recalc **100 → 77 ms** (A-B-A: 100 / 77 / 105, dip tracks the build); mobile flat (77 / 79 / 76); task totals within noise; computed-style sweep 0 diffs / 373 elements; pixel diff 0/0/0 |
| 8 assets | `dist/` file count/size; favicon | `dist/` **626.65 KiB / 16 files → 433.46 KiB / 13 files** (gzip 414.62 → 232.23 KiB): latin-ext subsets dropped (no content char in U+0100–024F, never fetched — audit shows only the 3 latin woff2 requested), og.jpg 2400×1260 @ 109 KiB → 1200×630 @ 48 KiB; favicon.svg referenced correctly; pixel 0/0/0 |
| 9 a11y/CI | a11y ≥ 95, BP 100; CI green | a11y **100/100**, BP **100/100** (footer contrast 3.46:1 → 5.31:1, pixel diff = the 502-px text row only), CI added (`.github/workflows/ci.yml`: npm ci → oxlint → tsc + build + bundle report), all steps green locally |

### Final scroll state (corrected full-page protocol, post-phase-9)

| metric | desktop 1440×900 1× | mobile 390×844 DPR3 4× |
|---|---:|---:|
| scripting | 16 ms | 32 ms |
| task total | 306–342 ms | ~320 ms |
| style recalc | **77 ms** (was 100; 171–183 count) | 79 ms (153 count) |
| layout | 1 | 1 |
| long tasks / dropped | 0 / 0 (first-scan raster hitches only) | 0 / 0 |
| reveals | 28/28 | 28/28 |
| glass generations | — | 2 × 256 on load, 0 on menu open |

### Final Lighthouse (this session)

| | desktop | mobile |
|---|---:|---:|
| performance | 100 | 94 (median of 16 runs, 92–97) |
| accessibility | 100 | 100 |
| best-practices | 100 | 100 |
| seo | 100 | 100 |
| CLS / FCP / LCP | — | 0 / 1.5 s / 2.2–2.3 s |

Mobile performance caveat, measured not assumed: the phase-0 baseline build,
run interleaved in the same sessions, scores a median ~97 (90–99), and its
simulated TBT (70–100 ms) sits below ours (130–290 ms). That gap does **not**
reproduce reliably: the same HEAD bytes measured TBT 130 and 240–250 in
different batches, and the winner flips with run position (odd runs inflate,
even runs deflate — 4 batches, order swapped), so Lighthouse's simulated TBT
on this machine is treated as position/session noise.

The deterministic counterweight is a direct load harness (real 4× CPU
throttle, `Performance.getMetrics` deltas + in-page `longtask`, 6 s after
load, 3 interleaved rounds across four builds):

| build | script CPU | task CPU | layout | recalc | blocking | longest task |
|---|---:|---:|---:|---:|---:|---:|
| HEAD (phase 9) | 0.14 s | 0.30 s | 6 | 39 | **64 ms** | **114 ms** |
| phase 0 baseline | 0.16 s | 0.44 s | 11 | 42 | 83 ms | 133 ms |
| after phase 3 | 0.14 s | 0.33 s | 6 | 41 | 86 ms | 136 ms |
| after phase 5 | 0.16 s | 0.36 s | 6 | 39 | 99 ms | 149 ms |

HEAD is better than the baseline on every direct axis (−23 % task CPU,
−23 % blocking, −45 % layout). No real load-time regression found; the
Lighthouse score delta is isolated to its network/CPU simulation model.
