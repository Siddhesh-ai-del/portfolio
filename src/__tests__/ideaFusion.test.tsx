// IdeaFusion 2026–27 — the real entry on the Events page (/07).
//
// It is a "featured" row: the standard chip → title → detail header, plus an
// inline block (banner image, description, fact tags, photo gallery) that
// SectionList only renders for items carrying those optional fields. The
// assertions pin the copy the event is defined by — organiser, format,
// timing and domains — so an accidental trim of the description fails here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Events from '../components/Events';
import { eventItems } from '../lib/sectionData';
import { jpegSize } from '../test/jpeg';

afterEach(() => {
  vi.restoreAllMocks();
});

/** The featured row container for a given entry title. */
function rowFor(title: string): HTMLElement {
  const h3 = screen.getByRole('heading', { level: 3, name: title });
  return h3.closest('.group') as HTMLElement;
}

describe('Events — IdeaFusion 2026–27', () => {
  it('renders the row header: placement chip, title and detail', () => {
    render(<Events />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'IdeaFusion 2026–27' })
    ).toBeInTheDocument();
    // The result is the row's headline attribute — same convention the
    // Hackathons rows use for Winner / Finalist. Scoped to THIS row: the
    // TechnoFest entry shares the chip.
    expect(within(rowFor('IdeaFusion 2026–27')).getByText('2nd Place')).toBeInTheDocument();
    // ...so the category chip no longer carries the event type.
    expect(screen.queryByText('Ideathon')).toBeNull();
    expect(screen.getByText('2026–27 · IEEE · Pune')).toBeInTheDocument();
  });

  it('states the result in the copy, with the idea that earned it', () => {
    render(<Events />);
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/placed second/i);
    expect(text).toContain('RetinaScan AI');
  });

  it('shows the banner image with a descriptive alt and lazy loading', () => {
    render(<Events />);
    const banner = screen.getByRole('img', { name: /ideafusion.*banner/i });
    expect(banner).toHaveAttribute('src', '/events/ideafusion-banner.jpeg');
    expect(banner).toHaveAttribute('loading', 'lazy');
    // This ROW's media set only: banner + three supporting photos (other
    // entries bring their own, so counting across the page would couple
    // this test to unrelated rows).
    expect(rowFor('IdeaFusion 2026–27').querySelectorAll('img')).toHaveLength(4);
  });

  it('describes the organiser, format and venues', () => {
    render(<Events />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('IEEE Student Branch');
    expect(text).toContain('IEEE Pune Section');
    // In-person in Pune; 7 minutes to present, 3 minutes of Q&A.
    expect(text).toMatch(/in-person/i);
    expect(text).toMatch(/Pune/);
    expect(text).toMatch(/7\s*min/i);
    expect(text).toMatch(/3\s*min/i);
  });

  it('lists every ideathon domain', () => {
    render(<Events />);
    const text = document.body.textContent ?? '';
    for (const domain of [
      'HealthTech',
      'EdTech',
      'FinTech',
      'AgriTech',
      'MedTech',
      'Open Innovation',
    ]) {
      expect(text).toContain(domain);
    }
  });

  it('replaces the placeholder rows instead of stacking them underneath', () => {
    render(<Events />);
    expect(screen.queryByText(/placeholder/i)).toBeNull();
    // Exactly the real entries — one heading each, both present.
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(eventItems.length);
    expect(screen.getByRole('heading', { level: 3, name: 'TechnoFest 2026' })).toBeInTheDocument();
  });

  it('keeps the shared hairline list styling around the featured row', () => {
    const { container } = render(<Events />);
    // The LIST wrapper (a direct child of the header container) carries the
    // top rule; every row a bottom one. Asserted structurally rather than by
    // class count, because featured rows add their own hairlines deeper in
    // the tree (team dividers).
    const wrapper = container.querySelector('section > div > .border-t.border-hairline');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelectorAll('.border-b.border-hairline')).toHaveLength(
      eventItems.length
    );
  });
});

describe('Events — IdeaFusion team credit', () => {
  it('names the team and lists every member with their year/branch', () => {
    render(<Events />);
    expect(screen.getByText('Team IRIS')).toBeInTheDocument();
    for (const member of [
      'Siddhesh V Kadlag — SE AIDS',
      'Harshal R Pawar — SE CE',
      'Prachi Kale — SE AIDS',
    ]) {
      expect(screen.getByText(member)).toBeInTheDocument();
    }
  });
});

describe('Events — gallery crop safety', () => {
  it('ships the once-portrait photo pre-cropped to the tile ratio', () => {
    // The tile is aspect-3/2 with object-cover: a file whose own ratio is
    // 3:2 fills it exactly, so no object-position anchor can hide content.
    const { w, h } = jpegSize('events/ideafusion-presenting.jpg');
    expect(w / h).toBeCloseTo(1.5, 2);
  });

  it('anchors that photo centrally rather than to its (empty) top edge', () => {
    render(<Events />);
    const presenting = screen.getByRole('img', { name: /presenting/i });
    expect(presenting.className).toContain('object-center');
    expect(presenting.className).not.toContain('object-top');
  });
});
