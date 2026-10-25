// Behavioural contract for the shared scroll-spy hook.
//
// This logic lived inline in Nav's Effect 1 and was extracted so the new
// bottom pill reuses it instead of maintaining a second copy. These tests
// characterize the EXISTING behaviour (including one documented quirk) so the
// extraction cannot change what the top pill does.
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useScrollSpy } from '../useScrollSpy';

// jsdom has no layout, so offsets are stubbed per element; the hook reads
// `el.offsetTop` (its own property shadows the prototype getter).
function setOffset(el: HTMLElement, top: number) {
  Object.defineProperty(el, 'offsetTop', { value: top, configurable: true });
}

// Mirrors the Bubble structure: a fixed wrapper > content div with
// overflow-y auto (findScrollSurface's match) > sections + the anchor.
// Offsets: a=400, b=900, c=1400. The activation line is
// scrollTop + innerHeight * 0.35 (768 * 0.35 = 268.8 in jsdom).
function buildPage() {
  document.body.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'site-bubble';
  const surface = document.createElement('div');
  surface.style.overflowY = 'auto';
  const offsets: Record<string, number> = { a: 400, b: 900, c: 1400 };
  for (const [id, top] of Object.entries(offsets)) {
    const section = document.createElement('section');
    section.id = id;
    setOffset(section, top);
    surface.append(section);
  }
  const anchor = document.createElement('nav');
  surface.append(anchor);
  root.append(surface);
  document.body.append(root);
  return { surface, anchor };
}

const IDS = ['a', 'b', 'c'];

// Dispatch a scroll after moving the surface: the hook coalesces events into
// one rAF callback, so awaiting the NEXT frame is what guarantees the state
// update has landed.
async function scrollSurface(surface: HTMLElement, top: number) {
  await act(async () => {
    surface.scrollTop = top;
    window.dispatchEvent(new Event('scroll'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

let surface: HTMLElement;
let anchor: HTMLElement;

beforeEach(() => {
  ({ surface, anchor } = buildPage());
});

describe('useScrollSpy', () => {
  it('starts with nothing active when no section has crossed the line', () => {
    const anchorRef = { current: anchor };
    const { result } = renderHook(() => useScrollSpy(IDS, anchorRef));
    expect(result.current).toBe('');
  });

  it('activates the last section whose top has crossed the activation line', async () => {
    const anchorRef = { current: anchor };
    const { result } = renderHook(() => useScrollSpy(IDS, anchorRef));

    // 200 + 268.8 = 468.8 → only `a` (400) crossed.
    await scrollSurface(surface, 200);
    expect(result.current).toBe('a');

    // 700 + 268.8 = 968.8 → a and b crossed; `b` is deepest.
    await scrollSurface(surface, 700);
    expect(result.current).toBe('b');

    await scrollSurface(surface, 1300);
    expect(result.current).toBe('c');
  });

  it('walks back up when scrolling to the top', async () => {
    const anchorRef = { current: anchor };
    const { result } = renderHook(() => useScrollSpy(IDS, anchorRef));

    await scrollSurface(surface, 1300);
    expect(result.current).toBe('c');
    await scrollSurface(surface, 0);
    expect(result.current).toBe('');
  });

  it('does not re-render when the active section is unchanged', async () => {
    const anchorRef = { current: anchor };
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useScrollSpy(IDS, anchorRef);
    });

    await scrollSurface(surface, 700);
    expect(result.current).toBe('b');
    const settled = renders;

    // Same position, several more scroll events: no state change, no render.
    await scrollSurface(surface, 700);
    await scrollSurface(surface, 710); // still within b (900 - 268.8 = 631..)
    expect(result.current).toBe('b');
    expect(renders).toBe(settled);
  });

  it('re-measures offsets when the viewport resizes', async () => {
    const anchorRef = { current: anchor };
    const { result } = renderHook(() => useScrollSpy(IDS, anchorRef));

    await scrollSurface(surface, 700);
    expect(result.current).toBe('b');

    // Layout shift (fonts/resize): `b` moves far down the page.
    setOffset(document.getElementById('b')!, 5000);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    // At 700 + 268.8 only `a` (400) still qualifies after re-measure.
    expect(result.current).toBe('a');
  });

  it('stops updating after unmount', async () => {
    const anchorRef = { current: anchor };
    let renders = 0;
    const { result, unmount } = renderHook(() => {
      renders += 1;
      return useScrollSpy(IDS, anchorRef);
    });

    await scrollSurface(surface, 700);
    expect(result.current).toBe('b');
    const atUnmount = renders;
    unmount();

    // Listeners must be gone: a further scroll may not schedule anything.
    await scrollSurface(surface, 1300);
    expect(renders).toBe(atUnmount);
  });

  // A missing id (element not in this document) must be IGNORED, not
  // measured as 0. This is what the original Nav comment claimed, and it went
  // from theoretical to load-bearing when the section pages landed: on
  // /hackathons.html the top nav's #focus/#systems/... targets don't exist,
  // and a 0 offset would make the last of them "active" on every scroll,
  // permanently underlining the wrong link.
  it('ignores an id whose element is not in this document', async () => {
    const anchorRef = { current: anchor };
    // No `ghost` element exists anywhere.
    const { result } = renderHook(() => useScrollSpy(['ghost'], anchorRef));
    await scrollSurface(surface, 700);
    expect(result.current).toBe('');
  });

  it('does not let a missing id steal the active state from a real one', async () => {
    const anchorRef = { current: anchor };
    const { result } = renderHook(() => useScrollSpy(['a', 'ghost'], anchorRef));

    // a (400) has crossed at 700 + 268.8 = 968.8; `ghost` must not override.
    await scrollSurface(surface, 700);
    expect(result.current).toBe('a');
  });
});
