// Shared scroll-spy for the floating pills.
//
// Extracted verbatim from Nav's Effect 1 (the top pill's behaviour) so the
// bottom pill reuses the same logic instead of maintaining a second copy —
// two owners would inevitably drift and disagree about which section is
// current. `src/lib/__tests__/useScrollSpy.test.ts` pins the behaviour.
//
// How it behaves:
//   - section offsets AND the scroll surface are measured once, then again on
//     resize and on fonts-ready (late-loading fonts shift layout);
//   - every scroll event is coalesced into at most one rAF callback;
//   - the activation line sits at 35% of the viewport height, so a section
//     counts as "current" once it's comfortably past the top;
//   - ids are expected in PAGE ORDER, so "last whose top crossed the line" ==
//     "deepest section in view";
//   - an unchanged section never calls setState (the ref bails out before
//     React's dispatcher, so we don't lean on React's value-equality
//     eager-bailout, which is an implementation detail).
//
// Scrolling lives on the Bubble content div, not the document (see
// lib/scrollSurface.ts): offsets come from offsetTop (sections' offset parent
// IS that content div, which keeps them in scroll coordinates), position is
// read from the surface with a window fallback, and the scroll listener is
// registered in the CAPTURE phase — scroll events don't bubble, but capture
// sees the surface's scroll on its way down. `passive: true` keeps scrolling
// smooth; cleanup cancels the pending frame and removes both listeners
// (removeEventListener must repeat the capture flag).
import { useEffect, useRef, useState, type RefObject } from 'react';
import { findScrollSurface } from './scrollSurface';

/**
 * @param ids section ids in page order (typically `links.map(l => l.href.slice(1))`)
 * @param anchorRef any element inside the scroll surface — the hook walks up
 *   from it to find that surface (pass the pill's own `<nav>` ref)
 * @returns the id of the current section, or `''` near the top of the page
 */
export function useScrollSpy(
  ids: readonly string[],
  anchorRef?: RefObject<HTMLElement | null>
): string {
  const [active, setActive] = useState('');
  // Bails out before React's dispatcher so an unchanged section never queues
  // work, even at ~60 scroll events per second.
  const activeRef = useRef('');
  // Read through a ref so the effect's identity depends on the ids' CONTENTS
  // (joined below) rather than on array identity, which would be a new array
  // on every render of a caller that maps inline.
  const idsRef = useRef(ids);
  idsRef.current = ids;
  const idsKey = ids.join('\u0000');

  useEffect(() => {
    const idList = idsRef.current;
    let rafId = 0;
    let offsets: (number | null)[] = [];
    let surface: HTMLElement | null = null;

    // (Re)read each target's offset within the scroll surface. An id with no
    // element in THIS document measures as null and is skipped entirely —
    // on the section pages the top nav's targets (#focus etc.) simply don't
    // exist, and treating them as offset 0 would mark them active on every
    // scroll (see the characterisation tests).
    const measure = () => {
      const anchor = anchorRef?.current;
      surface = anchor ? findScrollSurface(anchor) : null;
      offsets = idList.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : null;
      });
    };

    // Pick the last section whose top has crossed the activation line.
    const onScroll = () => {
      const pos =
        (surface ? surface.scrollTop : window.scrollY) +
        window.innerHeight * 0.35;
      let current = '';
      for (let i = 0; i < idList.length; i++) {
        const offset = offsets[i];
        if (offset !== null && offset <= pos) current = idList[i];
      }
      if (current === activeRef.current) return;
      activeRef.current = current;
      setActive(current);
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(onScroll);
    };

    // Resize invalidates offsets AND the activation line, so remeasure
    // inside the same rAF slot rather than only re-running onScroll.
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        measure();
        onScroll();
      });
    };

    measure();
    onScroll();
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });
    // Web fonts swap in after first paint and move every section; remeasure
    // once fonts settle. The rejection handler keeps a font error from
    // becoming an unhandled rejection (offsets would just stay as measured).
    const handleFontsReady = () => {
      measure();
      onScroll();
    };
    document.fonts?.ready.then(handleFontsReady, () => {});
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
    // `idsKey` covers the ids' contents; anchorRef is a stable ref object from
    // the caller, listed for completeness.
  }, [idsKey, anchorRef]);

  return active;
}
