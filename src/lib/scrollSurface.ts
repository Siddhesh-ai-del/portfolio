import { useEffect } from 'react';

// Scroll-surface lookup for the Bubble-wrapped page.
//
// The Bubble component (src/components/Bubble.tsx) fixes itself to the
// viewport and renders the site's content inside a div with `overflow: auto`,
// so THAT div — not the document — becomes the element users actually scroll.
// Its position in the DOM differs between Bubble's two rendering modes:
//   - html-in-canvas mode: wrapper > canvas > content div
//   - fallback mode:       wrapper > content div
// Walking up from any element inside the page and testing computed overflow
// finds it in both modes without depending on either structure, and returns
// null when no such surface exists (e.g. Bubble removed) so callers can fall
// back to window scrolling.
export function findScrollSurface(from: Element): HTMLElement | null {
  for (let el = from.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
  }
  return null;
}

// Same lookup, but from the document root — for callers that sit OUTSIDE the
// Bubble tree (keyboard events target <body>, which is a sibling of the
// fixed wrapper, so the ancestor walk above can never reach the surface).
export function getPageScrollSurface(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    '.site-bubble > canvas > div, .site-bubble > div'
  );
}

// Initial deep links (#section). The UA's own fragment navigation aims at the
// document scrolling element, which the Bubble layout leaves inert, so a fresh
// load with a hash lands at the top of the page. Re-anchor onto the surface
// once after mount (one frame, so layout and the surface exist) and again when
// fonts settle — the swap moves every section's offset, the same shift Nav
// re-measures. Later hash CHANGES keep the UA behavior, which already scrolls
// the surface correctly (verified: in-page anchor clicks work unaided).
export function useHashScroll() {
  useEffect(() => {
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return; // malformed percent-encoding — nothing to anchor to
    }
    if (!id) return;

    let cancelled = false;
    const anchor = () => {
      if (cancelled) return;
      const target = document.getElementById(id);
      if (!target) return;
      const surface = getPageScrollSurface();
      if (!surface) {
        target.scrollIntoView();
        return;
      }
      // Rect math instead of offsetTop so the target anchors correctly even
      // if it ever nests inside a positioned sub-container.
      surface.scrollTop =
        target.getBoundingClientRect().top -
        surface.getBoundingClientRect().top +
        surface.scrollTop;
    };

    const frame = requestAnimationFrame(anchor);
    document.fonts?.ready.then(anchor, () => {});
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);
}

// Keyboard page-scroll fallback. Once the Bubble surface scrolls the page,
// the document scrolling element is inert, so the UA's default key scrolling
// (Space / PageUp / PageDown / Home / End / arrows with nothing focused) aims
// at a non-scrollable element and silently does nothing. This forwards those
// keys to the surface when — and only when — focus sits on the body: focused
// elements (links, buttons, fields) keep the UA behavior, which already
// scrolls the nearest scrollable ancestor — the same surface — so keys are
// never handled twice. Ctrl/Cmd+Home/End also jump, since their default
// target is the dead document scroller too; other modified keys are left to
// the browser.
export function usePageScrollKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target !== document.body && target !== document.documentElement) return;
      const jump = (event.key === 'Home' || event.key === 'End') && !event.altKey;
      if ((event.ctrlKey || event.metaKey || event.altKey) && !jump) return;
      const surface = getPageScrollSurface();
      if (!surface) return;

      // ~one viewport per press for Space/Page keys, ~a line for arrows
      // (40px approximates the UA default arrow step on desktop).
      const page = Math.max(surface.clientHeight * 0.9, 1);
      const line = 40;
      let top: number | null = null;
      switch (event.key) {
        case ' ':
        case 'Spacebar': // legacy Edge key name, kept for older engines
        case 'PageDown':
          top = surface.scrollTop + page;
          break;
        case 'PageUp':
          top = surface.scrollTop - page;
          break;
        case 'ArrowDown':
          top = surface.scrollTop + line;
          break;
        case 'ArrowUp':
          top = surface.scrollTop - line;
          break;
        case 'Home':
          top = 0;
          break;
        case 'End':
          top = surface.scrollHeight;
          break;
      }
      if (top === null) return;
      event.preventDefault();
      surface.scrollTop = top; // clamped by the surface itself
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
