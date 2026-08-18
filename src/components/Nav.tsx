import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Focus', href: '#focus' },
  { label: 'Systems', href: '#systems' },
  { label: 'Activities', href: '#research' },
  { label: 'Stack', href: '#stack' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
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
      setScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 zen-ease ${
        scrolled ? 'bg-paper/85 backdrop-blur-md border-b border-hairline' : 'bg-transparent'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
        <a
          href="#hero"
          className="text-xl font-semibold tracking-[-0.01em] text-ink hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 zen-ease"
        >
          Siddhesh Kadlag
        </a>

        <div className="hidden md:flex items-center gap-10">
          {links.map((link, i) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`group relative font-mono text-[11px] tracking-[0.18em] uppercase focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-500 zen-ease after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:h-px after:bg-bronze-500 after:transition-all after:duration-500 after:zen-ease ${isActive ? 'text-ink after:w-full' : 'text-espresso-600 hover:text-ink after:w-0 group-hover:after:w-full'}`}
              >
                <span className="text-bronze-500 mr-1.5">0{i + 1}.</span>
                {link.label}
              </a>
            );
          })}
        </div>

        <button
          className="md:hidden text-ink p-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-paper/95 backdrop-blur-md border-b border-hairline">
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-700 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 transition-colors duration-300 zen-ease"
              >
                <span className="text-bronze-500 mr-1.5">0{i + 1}.</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}