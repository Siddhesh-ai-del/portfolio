// Root composition — the entire single-page portfolio in section order.
// No router and no state: the page is one scroll document, so App's only job
// is to stack the sections and keep <main> as the single landmark for the
// content between nav and footer (accessibility, skip-link targeting).
//
// On pointer devices the whole tree is wrapped in <Bubble> (Canvas UI's
// cursor metaball effect): the wrapper fixes itself to the viewport and its
// content div becomes the page's scroll surface — the same full-page pattern
// the component's own demos use. Everything scroll-related (Nav scroll-spy,
// anchor smoothness, the overflow-x guard) targets that surface; see
// src/lib/scrollSurface.ts.
//
// Phones/tablets get a plain surface instead (see useBubbleEnabled): there is
// no cursor to trail, and Bubble is the page's only per-frame WebGL +
// content-capture cost, so it never mounts on touch/small viewports.

import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Focus from './components/Focus';
import Systems from './components/Systems';
import Research from './components/Research';
import Stack from './components/Stack';
import Certifications from './components/Certifications';
import Footer from './components/Footer';
import Bubble from './components/Bubble';
import { useHashScroll, usePageScrollKeys } from './lib/scrollSurface';

// Phones, tablets and small windows: no cursor to trail (the effect's whole
// point) and, if html-in-canvas is ever enabled on them, Bubble would add a
// per-frame WebGL pass plus content capture for no benefit. MatchMedia over
// a width check alone so iPads and any touch-primary device are covered.
const TOUCH_VIEWPORT = '(max-width: 767px), (pointer: coarse), (hover: none)';

function useBubbleEnabled() {
  const [enabled, setEnabled] = useState(
    () => !window.matchMedia(TOUCH_VIEWPORT).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(TOUCH_VIEWPORT);
    const onChange = () => setEnabled(!query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return enabled;
}

export default function App() {
  // Keep deep links (#section) landing on their target and Space/arrows/
  // Home/End scrolling working now that the surface div (not the document)
  // is the scroller — see lib/scrollSurface.ts.
  useHashScroll();
  usePageScrollKeys();
  const bubbleEnabled = useBubbleEnabled();

  const content = (
    <>
      {/* The ambient page background (paper + grain + washes) is CSS on the
          scroll surface (index.css), not DOM: body's background isn't part of
          Bubble's captured subtree, and position:fixed layers scroll out of
          html-in-canvas captures. */}
      <Nav />
      <main>
        {/* Reading order == DOM order == visual order; each section is a
            self-contained block with its own id used by Nav scroll-spy. */}
        <Hero />
        <Focus />
        <Systems />
        <Research />
        <Stack />
        <Certifications />
      </main>
      <Footer />
    </>
  );

  if (!bubbleEnabled) {
    // Mirrors Bubble's fallback markup exactly (site-bubble wrapper fixed to
    // the viewport > scrollable content div) so findScrollSurface, the
    // scroll-spy hooks and every `.site-bubble > div` rule apply unchanged —
    // minus the canvases. The inline styles are the component's own content
    // div styles; keep them in sync if Bubble.tsx ever changes them.
    return (
      <div className="site-bubble" style={{ position: 'fixed', inset: 0 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  // Diameter knobs (size = droplet RADIUS in CSS px). The parked diameter
  // is NOT just size: overlapping metaball spheres smooth-min together with
  // a bulge of ln(trail+1)/blend × (viewport/2) px — at the defaults
  // (size 30, trail 24, blend 14) that stacks to a ~150px blob, and even
  // size 6 still pooled to ~128px. blend 44 collapses the bulge to ~18px,
  // so the final droplet lands around ~45px across.
  return (
    <Bubble
      className="site-bubble"
      style={{ position: 'fixed', inset: 0 }}
      size={5}
      trail={8}
      blend={44}
    >
      {content}
    </Bubble>
  );
}
