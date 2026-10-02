import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Glass } from '@samasante/liquid-glass';

const links = [
  { label: 'Focus', href: '#focus' },
  { label: 'Systems', href: '#systems' },
  { label: 'Activities', href: '#research' },
  { label: 'Stack', href: '#stack' },
];

// Lens look for the floating nav glass. Thin frost (2px, not the library's
// frosted-glass default of 6) + a faint white veil so the links stay legible
// while the page refracts underneath.
const pillOptics = { frost: 2, brightness: 0.1 };
// The mobile menu reads as denser text over moving content: frost it a touch
// more and veil a touch stronger.
const menuOptics = { frost: 3, brightness: 0.14 };

const pillTint = { background: 'rgba(255, 255, 255, 0.42)' };
const menuTint = { background: 'rgba(255, 255, 255, 0.55)' };

const glassEdge =
  'rounded-full border border-white/60 shadow-[0_12px_40px_-12px_rgba(32,30,27,0.18)]';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const ids = links.map((link) => link.href.slice(1));
    let rafId = 0;
    let offsets: number[] = [];

    const measure = () => {
      offsets = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
      });
    };

    const onScroll = () => {
      const pos = window.scrollY + window.innerHeight * 0.35;
      let current = '';
      for (let i = 0; i < ids.length; i++) {
        if (offsets[i] <= pos) current = ids[i];
      }
      setActive(current);
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(onScroll);
    };

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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      aria-label="Main navigation"
    >
      <div className="flex justify-center px-4 pt-4 sm:pt-5">
        <Glass
          className={`pointer-events-auto ${glassEdge}`}
          style={pillTint}
          optics={pillOptics}
        >
          <div className="flex items-center gap-6 px-5 py-2.5 sm:gap-8 sm:px-6 sm:py-3">
            <a
              href="#hero"
              className="text-lg font-semibold tracking-[-0.01em] text-ink hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 ease-zen"
            >
              Siddhesh Kadlag
            </a>

            <div className="hidden md:flex items-center gap-8">
              {links.map((link, i) => {
                const isActive = active === link.href.slice(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`group relative font-mono text-[11px] tracking-[0.18em] uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 ease-zen after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:h-px after:bg-bronze-500 after:transition-all after:duration-500 after:ease-zen ${isActive ? 'text-ink after:w-full' : 'text-espresso-600 hover:text-ink after:w-0 group-hover:after:w-full'}`}
                  >
                    <span className="text-bronze-500 mr-1.5">0{i + 1}.</span>
                    {link.label}
                  </a>
                );
              })}
            </div>

            <button
              className="md:hidden text-ink p-1 -mr-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </Glass>
      </div>

      {menuOpen && (
        <div className="md:hidden flex justify-center px-4 pt-2">
          <Glass
            className={`pointer-events-auto rounded-3xl border border-white/60 shadow-[0_16px_48px_-16px_rgba(32,30,27,0.22)]`}
            style={menuTint}
            optics={menuOptics}
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
