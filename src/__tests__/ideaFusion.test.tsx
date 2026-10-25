// IdeaFusion 2026–27 — the real entry on the Events page (/07).
//
// It is a "featured" row: the standard chip → title → detail header, plus an
// inline block (banner image, description, fact tags, photo gallery) that
// SectionList only renders for items carrying those optional fields. The
// assertions pin the copy the event is defined by — organiser, format,
// timing and domains — so an accidental trim of the description fails here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Events from '../components/Events';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Events — IdeaFusion 2026–27', () => {
  it('renders the row header: chip, title and detail', () => {
    render(<Events />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'IdeaFusion 2026–27' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ideathon')).toBeInTheDocument();
    expect(screen.getByText('2026–27 · IEEE · Pune')).toBeInTheDocument();
  });

  it('shows the banner image with a descriptive alt and lazy loading', () => {
    render(<Events />);
    const banner = screen.getByRole('img', { name: /ideafusion.*banner/i });
    expect(banner).toHaveAttribute('src', '/events/ideafusion-banner.jpeg');
    expect(banner).toHaveAttribute('loading', 'lazy');
    // One banner + three supporting photos — the full media set, nothing else.
    expect(screen.getAllByRole('img')).toHaveLength(4);
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
    expect(
      screen.getAllByRole('heading', { level: 3 })
    ).toHaveLength(1);
  });

  it('keeps the shared hairline list styling around the featured row', () => {
    const { container } = render(<Events />);
    expect(container.querySelectorAll('.border-t.border-hairline')).toHaveLength(1);
    expect(container.querySelectorAll('.border-b.border-hairline')).toHaveLength(1);
  });
});
