// BottomNav — contract for the bottom glass pill.
//
// Covers the parts that could silently break: the html-in-canvas-safe sticky
// structure (the reason this component can't just be `position: fixed`), the
// shared material, the link row, and — the important one — that scroll-spy
// actually lights up the right link against a real scroll surface.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import BottomNav from '../BottomNav';
import { glassEdge } from '../../lib/pillStyle';

// jsdom has no layout, so offsets are stubbed per section (own property
// shadows the prototype getter).
function setOffset(el: HTMLElement, top: number) {
  Object.defineProperty(el, 'offsetTop', { value: top, configurable: true });
}

// Mirrors the Bubble structure (fixed wrapper > overflow-y content div) with
// the three target sections pre-mounted, so the hook measures them on mount.
// NOTE: React EMPTIES the container it creates a root in, so the sections
// must be siblings of a dedicated mount div — not children of it, or the
// first render silently deletes them (and the spy then measures nothing).
function buildPage() {
  document.body.innerHTML = '';
  const surface = document.createElement('div');
  surface.style.overflowY = 'auto';
  const offsets: Record<string, number> = {
    hackathons: 1000,
    events: 2000,
    posts: 3000,
  };
  for (const [id, top] of Object.entries(offsets)) {
    const section = document.createElement('section');
    section.id = id;
    setOffset(section, top);
    surface.append(section);
  }
  const mount = document.createElement('div');
  surface.append(mount);
  document.body.append(surface);
  return { surface, mount };
}

async function scrollSurface(surface: HTMLElement, top: number) {
  await act(async () => {
    surface.scrollTop = top;
    window.dispatchEvent(new Event('scroll'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BottomNav', () => {
  it('is a labelled navigation landmark', () => {
    render(<BottomNav />);
    expect(screen.getByRole('navigation', { name: 'Post sections' })).toBeInTheDocument();
  });

  it('links the three post pages with their /0N numbers', () => {
    render(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: 'Post sections' });
    const anchors = [...nav.querySelectorAll('a')];
    // Document URLs, not anchors: each tap navigates to that page.
    expect(anchors.map((a) => a.getAttribute('href'))).toEqual([
      'hackathons.html',
      'events.html',
      'posts.html',
    ]);
    expect(anchors.map((a) => a.textContent)).toEqual([
      '06.Hackathons',
      '07.Events',
      '08.Posts',
    ]);
  });

  // The whole reason this component exists in this shape: fixed positioning
  // renders at the scroll-origin offset inside Bubble's html-in-canvas capture.
  it('uses the sticky zero-height wrapper with pointer-events split', () => {
    render(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: 'Post sections' });
    expect(nav).toHaveClass('sticky', 'bottom-0', 'h-0', 'pointer-events-none');
    // The inner pane carries the interactive glass.
    const glass = nav.querySelector('.pointer-events-auto');
    expect(glass).not.toBeNull();
    expect(glass).toHaveClass('rounded-full', 'border-white/60');
  });

  it('hangs the pill above the sticky line instead of below it', () => {
    // absolute bottom-0 inside the h-0 sticky box — a flow child would sit
    // under the document end and add dead scrollable space.
    render(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: 'Post sections' });
    const pane = nav.querySelector('.absolute');
    expect(pane).not.toBeNull();
    expect(pane).toHaveClass('bottom-0', 'left-0', 'right-0');
    // iOS home-indicator clearance.
    expect(pane?.className).toContain('env(safe-area-inset-bottom)');
  });

  it('keeps every link keyboard-focusable', () => {
    render(<BottomNav />);
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveClass('focus-visible:ring-bronze-500');
    }
  });

  it('lights up the link for the section at the activation line', async () => {
    const { surface, mount } = buildPage();
    render(<BottomNav />, { container: mount });

    // 900 + 768 * 0.35 = 1168.8 → only `hackathons` (1000) has crossed.
    await scrollSurface(surface, 900);
    const [hack, events, posts] = screen.getAllByRole('link');
    expect(hack).toHaveClass('after:w-full', 'text-ink');
    expect(events).toHaveClass('after:w-0');
    expect(posts).toHaveClass('after:w-0');

    // 1900 + 268.8 = 2168.8 → events (2000) is now the deepest crossed.
    await scrollSurface(surface, 1900);
    expect(hack).toHaveClass('after:w-0');
    expect(events).toHaveClass('after:w-full', 'text-ink');
    expect(posts).toHaveClass('after:w-0');

    // Nothing crossed: back at the top of the section block.
    await scrollSurface(surface, 0);
    expect(hack).toHaveClass('after:w-0');
    expect(events).toHaveClass('after:w-0');
  });

  it('renders all three links on a phone with no hamburger', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => false,
        }) as MediaQueryList
    );
    render(<BottomNav />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
    // The top nav needs a toggle below md; this pill must not.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shares the pill material constants (single source of truth)', () => {
    render(<BottomNav />);
    const glass = document.querySelector('.pointer-events-auto');
    // glassEdge carries the rounded-full + white hairline + shadow trio.
    for (const cls of glassEdge.split(' ')) expect(glass).toHaveClass(cls);
  });
});
