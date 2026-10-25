// BottomNav — the second glass pill, anchored to the bottom of the scroll
// surface of EVERY page, and the sole way into the three section pages
// (/06 Hackathons, /07 Events, /08 Posts). Its links are page URLs, so a tap
// is a normal cross-document navigation; the scroll-spy below just marks
// which of the three you are currently on.
//
// Markup mirrors Nav.tsx deliberately: same sticky-with-zero-height trick
// (html-in-canvas capture renders position:fixed descendants at their
// scroll-origin offset, so the pill must be `sticky` to be painted where
// users see it), same `pointer-events-none` nav + `pointer-events-auto` glass
// split, same shared material from lib/pillStyle, same shared scroll-spy.
//
// The one structural difference: Nav's child hangs DOWN from the sticky line
// (it's at the top), so it's in normal flow. This pill must hang UP from the
// line, so the inner div is `absolute bottom-0 left-0 right-0` — the nav is
// `position: sticky`, i.e. a containing block, and its height is 0, so
// `bottom: 0` puts the child's bottom edge on the sticky line and the pill
// grows upward from it. Flow would push the pill BELOW the document end
// (extending the scrollable area by its own height), which is why this isn't
// a copy of Nav's structure.
//
// It sits after <Footer /> as the LAST child of the scroll surface: sticky is
// constrained to its containing block, so placing it there makes the pill
// float at the viewport bottom across the whole page and settle at the true
// document end — anywhere earlier (e.g. inside <main>) would let it ride up
// and vanish as soon as the footer scrolls in.
import { useEffect, useRef, useState } from 'react';
import { Glass } from '@samasante/liquid-glass';
import { useScrollSpy } from '../lib/useScrollSpy';
import { pillTint, glassEdge, MOBILE_QUERY, pillOpticsFor } from '../lib/pillStyle';

const links = [
  { label: 'Hackathons', href: 'hackathons.html', id: 'hackathons', number: '06' },
  { label: 'Events', href: 'events.html', id: 'events', number: '07' },
  { label: 'Posts', href: 'posts.html', id: 'posts', number: '08' },
  // Each entry points at its own DOCUMENT (Vite MPA entry), not an in-page
  // anchor: clicking one is a full navigation to that section's page.
  // Numbered with the sections' own /0N eyebrows rather than restarting at 01
  // — the prefix is meant to point at the section it opens, and these three
  // are a contiguous block at the end of the site.
];

// Scroll-spy ids are the TARGET sections' ids, in page order. On a section
// page exactly one of them exists in the DOM, so that link lights up as
// "you are here"; on the home page none exist, so no link lights up — the
// pill is a set of destinations there, not a location marker.
const sectionIds = links.map((link) => link.id);

export default function BottomNav() {
  // Scroll-spy walks up from this element to find the page's scroll surface.
  const navRef = useRef<HTMLElement>(null);
  const active = useScrollSpy(sectionIds, navRef);
  // Track the breakpoint so the lens regenerates with the phone map size when
  // the viewport crosses it (rotation, split-screen) — same as Nav.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches); // close the race with the lazy initializer
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky bottom-0 z-50 h-0 pointer-events-none"
      aria-label="Post sections"
    >
      {/* Safe-area inset keeps the pill above the iOS home indicator; the
          absolute positioning is what lifts it above the sticky line (see the
          file header). */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <Glass
          className={`pointer-events-auto ${glassEdge}`}
          style={pillTint}
          optics={pillOpticsFor(isMobile)}
        >
          {/* Three short labels fit a phone row, so unlike the top nav there
              is no hamburger and no drop-down — the whole pill is the menu. */}
          <div className="flex items-center gap-4 px-4 py-2.5 sm:gap-6 sm:px-6">
            {links.map((link) => {
              const isActive = active === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`group relative font-mono text-[11px] tracking-[0.18em] uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 ease-zen after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:h-px after:bg-bronze-500 after:transition-[width] after:duration-500 after:ease-zen ${isActive ? 'text-ink after:w-full' : 'text-espresso-600 hover:text-ink after:w-0 group-hover:after:w-full'}`}
                >
                  <span className="text-bronze-500 mr-1.5">{link.number}.</span>
                  {link.label}
                </a>
              );
            })}
          </div>
        </Glass>
      </div>
    </nav>
  );
}
