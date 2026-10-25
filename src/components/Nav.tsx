// Nav — floating navigation pinned to the top of the scroll surface, always
// on top (z-50) and pointer-events-none at the <nav> level so only the glass
// pill and mobile menu itself intercept clicks/pointer input. `sticky` with
// a zero-height box instead of `fixed`: html-in-canvas capture renders
// position:fixed descendants at their scroll-origin offset, which would
// scroll the captured nav out of view — sticky is painted where users
// actually see it, and h-0 keeps the pill out of the content's flow.
// Composed of three pieces:
//   1. the desktop pill (Glass lens + wordmark + numbered section links),
//   2. the mobile hamburger button,
//   3. the mobile drop-down menu, pre-mounted during idle time.
// Behavior: scroll-spy comes from the shared useScrollSpy hook (extracted
// from this file's old Effect 1 — see lib/useScrollSpy.ts), plus two effects
// here: mobile-breakpoint sync and idle pre-arming of the menu.
import { useState, useEffect, useRef } from 'react';
import { Glass } from '@samasante/liquid-glass';
import { useScrollSpy } from '../lib/useScrollSpy';
import {
  pillTint,
  glassEdge,
  MOBILE_QUERY,
  pillOpticsFor,
} from '../lib/pillStyle';

// Inlined from lucide-react (Menu/X at size 20) — byte-identical markup to
// what the library rendered, without pulling the whole package into vendor.
const iconBase = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

function MenuIcon() {
  return (
    <svg {...iconBase} className="lucide lucide-menu">
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...iconBase} className="lucide lucide-x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

const links = [
  { label: 'Focus', href: '#focus' },
  { label: 'Systems', href: '#systems' },
  { label: 'Activities', href: '#research' },
  { label: 'Stack', href: '#stack' },
  // Deliberately only 4 entries: Certifications has no section id (not a
  // scroll-spy target), the footer's #connect is an external anchor, and the
  // post sections (/06–/08) belong to the BOTTOM pill (see BottomNav.tsx) —
  // none of those belong in this pill's numbered link row.
];

// Scroll-spy target ids in page order — the shared hook's expected shape.
// On the section pages none of these elements exist (they live in the home
// document), so Nav passes NO_IDS instead and the pill simply shows no active
// link there — see the `base` prop.
// The pill LINKS only the 4 above, but it must measure every section:
// otherwise, while the reader is in a post section (/06–/08), the last linked
// id (stack) would stay underlined even though this pill points at nothing
// there. Measuring them all means `active` can become an id this pill has no
// link for, so no link lights up — the correct "not one of my sections" state.
const sectionIds = [
  ...links.map((link) => link.href.slice(1)),
  'hackathons',
  'events',
  'posts',
];

// Stable empty list for section pages (a fresh [] per render would change the
// hook's ids key every render).
const NO_IDS: readonly string[] = [];

// NOTE: no local menu-* glass constants. The drop-down was cleared to the
// same look as the pill, so both <Glass> instances now take the shared
// pillOptics/pillTint from lib/pillStyle — one material, one place to tune
// it, and the two can't drift apart.

// `base` is a document-relative prefix for every anchor this pill renders:
//   ''             → plain same-page anchors (#focus) on the home page,
//                    which the browser smooth-scrolls without a reload;
//   'index.html'   → cross-document links (index.html#focus) from the three
//                    section pages, whose targets only exist in the home
//                    document.
interface NavProps {
  base?: string;
}

export default function Nav({ base = '' }: NavProps) {
  // menuOpen: user-toggled mobile menu visibility.
  const [menuOpen, setMenuOpen] = useState(false);
  // Root nav element — scroll-spy walks up from it to find the page's scroll
  // surface (the Bubble content div), which differs per rendering mode.
  const navRef = useRef<HTMLElement>(null);
  // active: current scroll-spy section id ("" near the top of the page). The
  // rAF-throttled measure/compare logic lives in lib/useScrollSpy.ts — it was
  // this component's Effect 1 and moved out so the bottom pill reuses it.
  const active = useScrollSpy(base ? NO_IDS : sectionIds, navRef);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  // menuArmed: the closed menu has been pre-mounted (its glass map generated)
  // at least once — see the idle pre-mount effect below.
  const [menuArmed, setMenuArmed] = useState(false);

  // Smaller displacement map on phones only — see MOBILE_MAP_SIZE in
  // lib/pillStyle.ts. pillOpticsFor returns a stable object per breakpoint,
  // so both <Glass> instances (pill and drop-down) share one optics identity.
  const glassOptics = pillOpticsFor(isMobile);

  // Effect 1 — mobile breakpoint sync. Track the mobile breakpoint so the
  // lens regenerates with the right map size when the viewport crosses it
  // (rotation, split-screen).
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches); // close the race with the lazy initializer
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Effect 2 — idle pre-mount of the closed menu. Pre-mount the closed menu
  // so its displacement map is generated during idle time, after fonts settle,
  // instead of on the tap that opens it — a fresh generation stalls that open
  // by ~100ms under 4× throttle. Hidden with `visibility` (not `display`) so
  // it keeps a real layout box; on desktop `md:hidden` makes it display:none,
  // so this generates nothing.
  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const arm = () => {
      if (cancelled) return;
      // rIC timeout covers browsers that starve idle; the 2.5s fallback
      // covers engines without requestIdleCallback (older Safari).
      const ric = window.requestIdleCallback;
      if (ric) {
        idleId = ric(() => {
          if (!cancelled) setMenuArmed(true);
        }, { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) setMenuArmed(true);
        }, 2500);
      }
    };
    if (document.fonts?.ready) document.fonts.ready.then(arm, arm);
    else arm();
    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 h-0 pointer-events-none"
      aria-label="Main navigation"
    >
      <div className="flex justify-center px-4 pt-4 sm:pt-5">
        <Glass
          className={`pointer-events-auto ${glassEdge}`}
          style={pillTint}
          optics={glassOptics}
        >
          <div className="flex items-center gap-6 px-5 py-2.5 sm:gap-8 sm:px-6 sm:py-3">
            <a
              href={`${base}#hero`}
              className="text-lg font-semibold tracking-[-0.01em] text-ink hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 ease-zen"
            >
              Siddhesh Kadlag
            </a>

            {/* Desktop branch — hidden below md, where the hamburger takes
                over. Each link carries a numbered bronze prefix (matching the
                section eyebrows) and an ::after rule-bar that widens to full
                width when active or hovered. */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link, i) => {
                const isActive = active === link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={`${base}${link.href}`}
                    className={`group relative font-mono text-[11px] tracking-[0.18em] uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 ease-zen after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:h-px after:bg-bronze-500 after:transition-[width] after:duration-500 after:ease-zen ${isActive ? 'text-ink after:w-full' : 'text-espresso-600 hover:text-ink after:w-0 group-hover:after:w-full'}`}
                  >
                    <span className="text-bronze-500 mr-1.5">0{i + 1}.</span>
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* Mobile branch — hamburger swaps Menu/X icons with the open
                state; aria-expanded mirrors menuOpen for screen readers. */}
            <button
              className="md:hidden text-ink p-1 -mr-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </Glass>
      </div>

      {/* Mobile menu panel — stays MOUNTED after the first idle arm so its
          glass map is only ever generated once. When closed it's `invisible`
          + aria-hidden + inert: no layout shift on open, and it can't be
          focused or announced. Links close the menu on click so a selection
          doesn't leave the panel covering the target section. */}
      {(menuOpen || menuArmed) && (
        <div
          className={`md:hidden flex justify-center px-4 pt-2 ${menuOpen ? '' : 'invisible'}`}
          aria-hidden={!menuOpen}
          inert={!menuOpen}
        >
          <Glass
            className={`pointer-events-auto rounded-3xl border border-white/60 shadow-[0_16px_48px_-16px_rgba(32,30,27,0.22)]`}
            style={pillTint}
            optics={glassOptics}
          >
            <div className="flex flex-col gap-4 px-6 py-5 min-w-[13rem]">
              {links.map((link, i) => (
                <a
                  key={link.href}
                  href={`${base}${link.href}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-700 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 transition-colors duration-300 ease-zen"
                >
                  <span className="text-bronze-500 mr-1.5">0{i + 1}.</span>
                  {link.label}
                </a>
              ))}
            </div>
          </Glass>
        </div>
      )}
    </nav>
  );
}
