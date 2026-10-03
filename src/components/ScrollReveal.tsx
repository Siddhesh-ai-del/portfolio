// ScrollReveal — wrapper that fades/slides its children in once, the first
// time they cross the viewport. Architecture: ONE module-level
// IntersectionObserver (created lazily-safe at import) is shared by every
// reveal on the page, so the page never pays per-element observer cost.
// Contract with the `observed` Map: register (set) on mount, unregister
// (delete) on unmount AND on first fire — a fired element is deleted before
// its callback runs, so each element can only ever reveal once and detached
// nodes are never retained. The component only toggles a class; all timing
// lives in CSS (see .reveal / .is-revealed in index.css), which keeps
// transition strings out of JS and lets the reduced-motion override work
// without any JS involvement.
import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Extra class names merged onto the wrapper's base `reveal` class. */
  className?: string;
  /** Stagger offset in ms, written to the `--reveal-delay` custom property
      that `.reveal`'s transition reads. 0 omits the style entirely. */
  delay?: number;
}

const OBSERVER_THRESHOLD = 0.12;

// One shared observer for every reveal on the page. Each element is
// unobserved as soon as it fires (and again on unmount), so callbacks can
// never stack and detached nodes are never kept alive by the map.
const observed = new Map<Element, () => void>();

const revealObserver: IntersectionObserver | null = (() => {
  if (typeof IntersectionObserver === 'undefined') return null;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = observed.get(entry.target);
        if (callback) {
          observed.delete(entry.target);
          callback();
        }
        io.unobserve(entry.target);
      }
    },
    { threshold: OBSERVER_THRESHOLD }
  );
  return io;
})();

// The reveal itself is a single class toggle: initial state, transition and
// stagger live in .reveal / .is-revealed in index.css (delay via
// --reveal-delay). No transition strings are built per element and the
// reduced-motion override applies without JS involvement.
export default function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // No IntersectionObserver: show immediately rather than leave the
    // content hidden forever.
    if (!revealObserver) {
      element.classList.add('is-revealed');
      return;
    }

    const reveal = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      element.classList.add('is-revealed');
    };

    observed.set(element, reveal);
    revealObserver.observe(element);

    return () => {
      observed.delete(element);
      revealObserver.unobserve(element);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      style={delay > 0 ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
