// App — integration test for section ORDER and pill wiring.
//
// Rendered in the touch/fallback branch (matchMedia reports the phone query
// as matching) because Bubble's branch mounts WebGL + canvas, which jsdom
// cannot run; both branches share the same `content` tree, so what this
// asserts holds for the Bubble branch too.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

afterEach(() => {
  vi.restoreAllMocks();
});

function renderApp() {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    // The phone query makes App pick the fallback surface (no Bubble/WebGL).
    const matches = query.includes('max-width: 767px');
    return {
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    } as MediaQueryList;
  });
  return render(<App />);
}

describe('App — home page', () => {
  it('stacks the home sections in page order inside <main>', () => {
    renderApp();
    const ids = [...document.querySelectorAll('main section')].map((s) => s.id);
    // hero → Focus /01 → Systems /02 → Research /03 → Stack /04 →
    // Certifications (deliberately id-less). The three post sections live on
    // their OWN pages — they must not appear here.
    expect(ids).toEqual(['hero', 'focus', 'systems', 'research', 'stack', '']);
  });

  it('keeps the post sections OFF the home page', () => {
    renderApp();
    for (const id of ['hackathons', 'events', 'posts']) {
      expect(document.getElementById(id)).toBeNull();
    }
    // Their eyebrow numbers belong to those pages only.
    for (const eyebrow of ['/06', '/07', '/08']) {
      expect(screen.queryByText(eyebrow)).toBeNull();
    }
  });

  // Sticky is constrained to its containing block — BottomNav must be the
  // last child of the scroll surface or it can't float over the footer.
  it('mounts BottomNav after the footer, as the last element of the surface', () => {
    renderApp();
    // App's fallback branch wraps content in site-bubble > scrollable div.
    const surface = document.querySelector('.site-bubble > div');
    const footer = surface?.querySelector('footer') ?? null;
    const bottomNav = surface?.querySelector('nav[aria-label="Post sections"]') ?? null;
    expect(footer).not.toBeNull();
    expect(bottomNav).not.toBeNull();
    expect(footer?.nextElementSibling).toBe(bottomNav);
    expect(surface?.lastElementChild).toBe(bottomNav);
  });

  it('keeps the top navigation landmark distinct from the bottom pill', () => {
    renderApp();
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Post sections' })
    ).toBeInTheDocument();
  });

  it('leaves the top nav linking only its own four sections', () => {
    renderApp();
    const top = screen.getByRole('navigation', { name: 'Main navigation' });
    const hrefs = [...top.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    // Wordmark + Focus/Systems/Activities/Stack — no post sections.
    expect(hrefs).toEqual([
      '#hero',
      '#focus',
      '#systems',
      '#research',
      '#stack',
    ]);
  });
});
