// Shared glass-pill contract — the single source of truth for what the
// floating pills look like.
//
// These constants began life inside Nav.tsx (the top pill defined them) and
// were extracted verbatim so the new bottom pill can render the *same*
// material: one `pillOptics` / `pillTint` / `glassEdge` means both pills are
// guaranteed identical, and tuning the look happens in exactly one place.
// `src/lib/__tests__/pillStyle.test.ts` pins the values so extraction and
// future edits can't drift them by accident.

/** Clear-liquid-glass optics: no frost, no white veil, gentle default
 *  refraction (`strength`/`bend`/`dispersion` at the library's material
 *  defaults) so the page reads straight through with only a soft fringe. */
export const pillOptics = {
  frost: 0,
  brightness: 0,
  strength: 0.05,
  bend: 0.45,
  dispersion: 0.32,
} as const;

/** A trace of white body so the pill's silhouette survives over equally
 *  light content; otherwise it's pure glass. */
export const pillTint = { background: 'rgba(255, 255, 255, 0.06)' } as const;

/** Rounded-full shape + hairline white edge + drop shadow (shared by both
 *  pills so they share an outline as well as a material). */
export const glassEdge =
  'rounded-full border border-white/60 shadow-[0_12px_40px_-12px_rgba(32,30,27,0.18)]' as const;

// Displacement-map resolution for phones (the Tailwind `md` breakpoint). The
// map generator runs in O(mapSize²): at the default 512 every map costs ~90ms
// of main thread under 4× CPU throttle. 256 still gives >2 map samples per
// device pixel across the pill, so the refraction/frost/tint/brightness — the
// feel — are unchanged; desktop keeps 512.
export const MOBILE_MAP_SIZE = 256;

// rem-based to track Tailwind's md (48rem) exactly under non-16px roots.
export const MOBILE_QUERY = '(max-width: 47.9375rem)';

// Pre-built mobile variant so `pillOpticsFor(true)` is referentially stable —
// a fresh object per render would defeat any memoized consumer upstream.
const pillOpticsMobile = { ...pillOptics, mapSize: MOBILE_MAP_SIZE };

/** The optics object for the current breakpoint. Identity is stable per
 *  breakpoint (callers may memoize on it) and the look itself never changes —
 *  only the map resolution does. */
export function pillOpticsFor(isMobile: boolean) {
  return isMobile ? pillOpticsMobile : pillOptics;
}
