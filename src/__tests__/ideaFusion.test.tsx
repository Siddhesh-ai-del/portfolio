// IdeaFusion 2026–27 — the real entry on the Events page (/07).
//
// It is a "featured" row: the standard chip → title → detail header, plus an
// inline block (banner image, description, fact tags, photo gallery) that
// SectionList only renders for items carrying those optional fields. The
// assertions pin the copy the event is defined by — organiser, format,
// timing and domains — so an accidental trim of the description fails here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
    // The LIST wrapper (a direct child of the header container) carries the
    // top rule; the single row carries the bottom one. Asserted structurally
    // rather than by class count, because a featured row's team divider adds
    // its own hairline deeper in the tree.
    const wrapper = container.querySelector('section > div > .border-t.border-hairline');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelectorAll('.border-b.border-hairline')).toHaveLength(1);
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
  // Minimal JPEG SOF marker reader — enough to pin width/height without an
  // image library, so a portrait file can never ship into the landscape box
  // again (that mismatch is what made the first gallery tile show nothing).
  function jpegSize(file: string): { w: number; h: number } {
    const buf = readFileSync(resolve(process.cwd(), 'public', file));
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0–SOF15 except DHT (C4) / JPG (C8) / DAC (CC), which aren't frames.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    throw new Error(`no SOF marker in ${file}`);
  }

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
