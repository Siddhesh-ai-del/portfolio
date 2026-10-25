// Characterization test for the shared glass-pill contract.
//
// These values are lifted verbatim from Nav.tsx (where the top pill defined
// them) so that extracting them into a shared module CANNOT silently change
// what the shipped pill looks like — the top pill's appearance is the
// specification. BottomNav must import the same objects, which is what
// guarantees the two pills read as one material.
import { describe, expect, it } from 'vitest';
import {
  pillOptics,
  pillTint,
  glassEdge,
  MOBILE_MAP_SIZE,
  MOBILE_QUERY,
  pillOpticsFor,
} from '../pillStyle';

describe('pillStyle — top pill values carried over unchanged', () => {
  it('keeps the clear-glass optics (no frost, no veil, gentle refraction)', () => {
    expect(pillOptics).toEqual({
      frost: 0,
      brightness: 0,
      strength: 0.05,
      bend: 0.45,
      dispersion: 0.32,
    });
  });

  it('keeps the near-invisible white tint', () => {
    expect(pillTint).toEqual({ background: 'rgba(255, 255, 255, 0.06)' });
  });

  it('keeps the rounded pill edge + shadow', () => {
    expect(glassEdge).toBe(
      'rounded-full border border-white/60 shadow-[0_12px_40px_-12px_rgba(32,30,27,0.18)]'
    );
  });

  it('keeps the phone displacement-map size and breakpoint query', () => {
    expect(MOBILE_MAP_SIZE).toBe(256);
    expect(MOBILE_QUERY).toBe('(max-width: 47.9375rem)');
  });
});

describe('pillOpticsFor — shared mobile/desktop switch', () => {
  it('returns the plain optics on desktop', () => {
    expect(pillOpticsFor(false)).toBe(pillOptics);
  });

  it('drops to the phone map size on mobile, keeping the look identical', () => {
    expect(pillOpticsFor(true)).toEqual({
      frost: 0,
      brightness: 0,
      strength: 0.05,
      bend: 0.45,
      dispersion: 0.32,
      mapSize: MOBILE_MAP_SIZE,
    });
  });

  it('is referentially stable across calls for the same breakpoint', () => {
    // Glass reads optics on every render; a new object per call would defeat
    // memoized consumers upstream.
    expect(pillOpticsFor(true)).toBe(pillOpticsFor(true));
    expect(pillOpticsFor(false)).toBe(pillOpticsFor(false));
  });
});
