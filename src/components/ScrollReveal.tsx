import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const REVEAL_TRANSITION = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
const OBSERVER_THRESHOLD = 0.12;

const revealed = (el: HTMLElement, delay: number) => {
  el.style.transition =
    delay > 0
      ? `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
      : REVEAL_TRANSITION;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
};

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

export default function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!revealObserver) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      return;
    }

    const reveal = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      revealed(element, delay);
    };

    observed.set(element, reveal);
    revealObserver.observe(element);

    return () => {
      observed.delete(element);
      revealObserver.unobserve(element);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: 'translateY(24px)' }}
    >
      {children}
    </div>
  );
}