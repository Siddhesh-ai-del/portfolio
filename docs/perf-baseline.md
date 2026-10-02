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
| style recalc | 0 ms (0 count) | 41 ms (148 000 count) |
| layout | 0 ms | 0 ms (1 000 count) |
| task total | 124 ms | 503 ms |
| paint/composite (residual) | 95 ms | 367 ms |

Load (before the scroll window): 1 long task per profile — desktop 79 ms,
mobile 61 ms (bundle exec + first glass map generation).

Note: mobile style recalc count (148 k over 6 s ≈ 411/frame, only 41 ms total)
is unattributed — candidate for investigation if it grows; not a bottleneck today.

## Phase → target metric map

| phase | primary target metrics | baseline |
|---|---|---|
| 1 build/bundle | critical-path gzip; vendor split; drop `lucide-react` | 84.32 KiB / single 234 KiB vendor |
| 2 fonts | mobile FCP/LCP; zero `fonts.googleapis.com` requests | FCP 1503 / LCP 2773 ms |
| 3 head/SEO | Lighthouse SEO ≥ 95 | 91 (needs robots.txt, canonical, OG) |
| 4 Nav | scripting ms during scroll; scroll re-renders | desktop 29 / mobile 95 ms |
| 5 ScrollReveal | style recalc count during scroll; reduced-motion correctness | mobile 148 000 count |
| 6 sections | paint/composite residual during scroll | desktop 95 / mobile 367 ms |
| 7 global CSS | task total during scroll | desktop 124 / mobile 503 ms |
| 8 assets | `dist/` file count/size; favicon | 6 files / 284 KiB raw |
| 9 a11y/CI | Lighthouse a11y ≥ 95, best-practices 100; CI green | a11y 94/95, BP 96 |

Invariants for every phase: scroll stays 60 fps with 0 dropped frames and
0 long tasks during scroll; glass pill/menu pixel diff ≈ 0; menu open stays
≤ 16.8 ms worst frame on mobile.
