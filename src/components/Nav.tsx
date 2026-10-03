// Nav — fixed floating navigation, always on top (z-50) and
// pointer-events-none at the <nav> level so only the glass pill and mobile
// menu itself intercept clicks/pointer input. Composed of three pieces:
//   1. the desktop pill (Glass lens + wordmark + numbered section links),
//   2. the mobile hamburger button,
//   3. the mobile drop-down menu, pre-mounted during idle time.
// Behavior lives in three effects: scroll-spy with rAF-throttled updates,
// mobile-breakpoint sync, and idle pre-arming of the menu (see each below).
import { useState, useEffect, useMemo, useRef } from 'react';
import { Glass } from '@samasante/liquid-glass';

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
  // scroll-spy target) and the footer's #connect is an external anchor, so
  // neither belongs in the pill's numbered link row.
];

// Lens look for the floating nav glass. Thin frost (2px, not the library's
// frosted-glass default of 6) + a faint white veil so the links stay legible
// while the page refracts underneath.
const pillOptics = { frost: 2, brightness: 0.1 };
// The mobile menu reads as denser text over moving content: frost it a touch
// more and veil a touch stronger.
const menuOptics = { frost: 3, brightness: 0.14 };

// Displacement-map resolution for phones (the Tailwind `md` breakpoint). The
// map generator runs in O(mapSize²): at the default 512 every map costs ~90ms
// of main thread under 4× CPU throttle — twice at load (the pill measures with
// fallback-font metrics, then regenerates when Inter swaps in half a pixel
// wider) and once per menu open. 256 still gives >2 map samples per device
// pixel across the pill, so the refraction/frost/tint/brightness — the feel —
// are unchanged; desktop keeps 512.
const MOBILE_MAP_SIZE = 256;
// rem-based to track Tailwind's md (48rem) exactly under non-16px roots.
const MOBILE_QUERY = '(max-width: 47.9375rem)';

const pillTint = { background: 'rgba(255, 255, 255, 0.42)' };
const menuTint = { background: 'rgba(255, 255, 255, 0.55)' };

const glassEdge =
  'rounded-full border border-white/60 shadow-[0_12px_40px_-12px_rgba(32,30,27,0.18)]';

export default function Nav() {
  // menuOpen: user-toggled mobile menu visibility.
  // active: current scroll-spy section id ("" near the top of the page).
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  // Scroll fires setActive ~60x/s while only a handful of section changes
  // actually happen per pass. The ref bails out before React's dispatcher,
  // so an unchanged section never queues work — we don't lean on React's
  // value-equality eager-bailout (an implementation detail) for that.
  const activeRef = useRef('');
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  // menuArmed: the closed menu has been pre-mounted (its glass map generated)
  // at least once — see the idle pre-mount effect below.
  const [menuArmed, setMenuArmed] = useState(false);

  // Smaller displacement map on phones only — see MOBILE_MAP_SIZE above.
  const pillGlassOptics = useMemo(
    () => (isMobile ? { ...pillOptics, mapSize: MOBILE_MAP_SIZE } : pillOptics),
    [isMobile]
  );
  const menuGlassOptics = useMemo(
    () => (isMobile ? { ...menuOptics, mapSize: MOBILE_MAP_SIZE } : menuOptics),
    [isMobile]
  );

  // Effect 1 — scroll-spy. Section offsets are measured once (and re-measured
  // on resize/fonts-ready, since late-loading fonts shift layout), then every
  // scroll event is coalesced into at most one rAF callback. The activation
  // line sits at 35% of the viewport height so a section counts as "current"
  // once it's comfortably past the top. `passive: true` keeps scrolling
  // smooth; cleanup cancels the pending frame and removes both listeners.
  useEffect(() => {
    const ids = links.map((link) => link.href.slice(1));
    let rafId = 0;
    let offsets: number[] = [];

    // (Re)read each target's document offset; 0 for missing elements so an
    // unmapped id simply never wins the comparison below.
    const measure = () => {
      offsets = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
      });
    };

    // Pick the last section whose top has crossed the activation line —
    // ids are in page order, so "last crossed" == "deepest one in view".
    const onScroll = () => {
      const pos = window.scrollY + window.innerHeight * 0.35;
      let current = '';
      for (let i = 0; i < ids.length; i++) {
        if (offsets[i] <= pos) current = ids[i];
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
    window.addEventListener('scroll', handleScroll, { passive: true });
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect 2 — mobile breakpoint sync. Track the mobile breakpoint so the
  // lens regenerates with the right map size when the viewport crosses it
  // (rotation, split-screen).
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches); // close the race with the lazy initializer
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Effect 3 — idle pre-mount of the closed menu. Pre-mount the closed menu
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
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      aria-label="Main navigation"
    >
      <div className="flex justify-center px-4 pt-4 sm:pt-5">
        <Glass
          className={`pointer-events-auto ${glassEdge}`}
          style={pillTint}
          optics={pillGlassOptics}
        >
          <div className="flex items-center gap-6 px-5 py-2.5 sm:gap-8 sm:px-6 sm:py-3">
            <a
              href="#hero"
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
                    href={link.href}
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
            style={menuTint}
            optics={menuGlassOptics}
          >
            <div className="flex flex-col gap-4 px-6 py-5 min-w-[13rem]">
              {links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
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
