// Section pages — integration tests for /hackathons.html, /events.html and
// /posts.html, each rendered through the SAME App tree the real documents
// use (src/section.tsx only picks the `page` prop from <body data-section>).
//
// What must hold on every one of them:
//   - exactly one section renders (its own), and nothing from the home stack;
//   - the top pill's anchors point back at the HOME document, since those
//     targets don't exist here;
//   - the bottom pill links all three pages and marks the current one, which
//     is only possible because the spy ignores ids absent from this document.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App, { type PageId } from '../App';

afterEach(() => {
  vi.restoreAllMocks();
});

function renderPage(page: PageId) {
  // Phone query matches → App takes the fallback surface (no Bubble/WebGL,
  // which jsdom can't run). Both branches share the same content tree.
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
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
  return render(<App page={page} />);
}

const pages: Array<{ page: Exclude<PageId, 'home'>; eyebrow: string; title: string }> = [
  { page: 'hackathons', eyebrow: '/06', title: 'Hackathons' },
  { page: 'events', eyebrow: '/07', title: 'Events' },
  { page: 'posts', eyebrow: '/08', title: 'Posts' },
];

describe.each(pages)('$page page', ({ page, eyebrow, title }) => {
  it('renders exactly that section — and none of the others', () => {
    renderPage(page);
    const ids = [...document.querySelectorAll('main section')].map((s) => s.id);
    expect(ids).toEqual([page]);
    expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    expect(screen.getByText(eyebrow)).toBeInTheDocument();
  });

  it('keeps the home stack off the section page', () => {
    renderPage(page);
    for (const id of ['hero', 'focus', 'systems', 'research', 'stack']) {
      expect(document.getElementById(id)).toBeNull();
    }
    expect(screen.queryByRole('heading', { name: 'Certifications & Licensing' })).toBeNull();
  });

  it('points the top pill back at the home document', () => {
    renderPage(page);
    const top = screen.getByRole('navigation', { name: 'Main navigation' });
    const hrefs = [...top.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      'index.html#hero',
      'index.html#focus',
      'index.html#systems',
      'index.html#research',
      'index.html#stack',
    ]);
    // The wordmark is the way home too.
    expect(screen.getByRole('link', { name: 'Siddhesh Kadlag' })).toHaveAttribute(
      'href',
      'index.html#hero'
    );
  });

  it('marks exactly its own link active in the bottom pill', () => {
    // Also guards the shared shell: ids missing from this document must not
    // make some other link look current.
    renderPage(page);
    const bottom = screen.getByRole('navigation', { name: 'Post sections' });
    const links = [...bottom.querySelectorAll('a')];
    const activeCount = links.filter((a) => a.classList.contains('after:w-full')).length;
    // Exactly one: the current page's own section (it IS in this document).
    expect(activeCount).toBe(1);
    const current = links.find((a) => a.classList.contains('after:w-full'));
    expect(current?.getAttribute('href')).toBe(`${page}.html`);
  });

  it('links every page from the bottom pill, footer present', () => {
    renderPage(page);
    const bottom = screen.getByRole('navigation', { name: 'Post sections' });
    const hrefs = [...bottom.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['hackathons.html', 'events.html', 'posts.html']);
    expect(document.querySelector('footer')).not.toBeNull();
    // The pill still sits last in the scroll surface (sticky containment).
    const surface = document.querySelector('.site-bubble > div');
    expect(
      surface?.querySelector('nav[aria-label="Post sections"]')
    ).toBe(surface?.lastElementChild);
  });
});

describe('App — home page bottom pill', () => {
  it('shows NO active link (none of the three targets live here)', () => {
    renderPage('home');
    const bottom = screen.getByRole('navigation', { name: 'Post sections' });
    const links = [...bottom.querySelectorAll('a')];
    expect(links.filter((a) => a.classList.contains('after:w-full'))).toHaveLength(0);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'hackathons.html',
      'events.html',
      'posts.html',
    ]);
  });
});
