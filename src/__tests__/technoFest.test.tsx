// TechnoFest 2026 — the second real entry on the Events page (/07).
//
// Facts pinned here come from the certificate visible in the row's own
// photo: SKH TechnoFest 2026, a national-level technical symposium at
// Late G. N. Sapkal College of Engineering (Sapkal Knowledge Hub, Anjaneri,
// Nashik), 2nd position in the AI Prompting (Prompt-Craft) event,
// 18 April 2026 — earned as a first-year student.
//
// Its gallery uses 4:5 PORTRAIT tiles (both photos are people-and-award
// shots where a landscape crop would cut the story out), so unlike the
// IdeaFusion row's 3:2 strip.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Events from '../components/Events';
import { jpegSize } from '../test/jpeg';

afterEach(() => {
  vi.restoreAllMocks();
});

function row(): HTMLElement {
  const h3 = screen.getByRole('heading', { level: 3, name: 'TechnoFest 2026' });
  return h3.closest('.group') as HTMLElement;
}

describe('Events — TechnoFest 2026', () => {
  it('renders the row header: placement chip, title and detail', () => {
    render(<Events />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'TechnoFest 2026' })
    ).toBeInTheDocument();
    expect(row().querySelector('span')?.textContent).toBe('2nd Place');
    expect(row().textContent).toContain('2026 · Prompt engineering · Nashik');
  });

  it('states the level, host, event and date in the copy', () => {
    render(<Events />);
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/national-level/i);
    expect(text).toContain('Sapkal');
    expect(text).toContain('AI Prompting');
    expect(text).toMatch(/18 April 2026|April 18, 2026/);
  });

  it('calls out that the placement came as a first-year student', () => {
    render(<Events />);
    expect(document.body.textContent ?? '').toMatch(/first-year/i);
  });

  it('shows both photos as 4:5 portrait tiles', () => {
    render(<Events />);
    const imgs = [...row().querySelectorAll('img')];
    expect(imgs.map((i) => i.getAttribute('src'))).toEqual([
      '/events/technofest-trophy.jpg',
      '/events/technofest-handover.jpg',
    ]);
    for (const img of imgs) {
      expect(img.className).toContain('aspect-[4/5]');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img.alt.length).toBeGreaterThan(10);
    }
  });

  it('ships both files at exactly 4:5 so object-cover has nothing to cut', () => {
    // Same guard as the IdeaFusion photo: the file's own ratio must equal
    // the tile's, or an anchor can hide content again.
    expect(jpegSize('events/technofest-trophy.jpg').w / jpegSize('events/technofest-trophy.jpg').h).toBeCloseTo(0.8, 2);
    expect(jpegSize('events/technofest-handover.jpg').w / jpegSize('events/technofest-handover.jpg').h).toBeCloseTo(0.8, 2);
  });
});
