// Contract for the three new content sections (/06 Hackathons, /07 Events,
// /08 Posts). All three are thin wrappers over the shared SectionList, so one
// parameterised suite covers each one's wiring: correct id (scroll-spy anchor),
// correct eyebrow number, correct heading, and one row per data item.
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Hackathons from '../Hackathons';
import Events from '../Events';
import Posts from '../Posts';
import { hackathonItems, eventItems, postItems } from '../../lib/sectionData';

const sections = [
  {
    name: 'Hackathons',
    Component: Hackathons,
    id: 'hackathons',
    eyebrow: '/06',
    title: 'Hackathons',
    items: hackathonItems,
  },
  {
    name: 'Events',
    Component: Events,
    id: 'events',
    eyebrow: '/07',
    title: 'Events',
    items: eventItems,
  },
  {
    name: 'Posts',
    Component: Posts,
    id: 'posts',
    eyebrow: '/08',
    title: 'Posts',
    items: postItems,
  },
] as const;

describe.each(sections)('$name section', ({ Component, id, eyebrow, title, items }) => {
  it('renders a section with the scroll-spy id the bottom pill targets', () => {
    render(<Component />);
    const section = document.getElementById(id);
    expect(section).not.toBeNull();
    expect(section?.tagName).toBe('SECTION');
  });

  it('shows the mono /0N eyebrow and the section heading', () => {
    render(<Component />);
    expect(screen.getByText(eyebrow)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: title })
    ).toBeInTheDocument();
  });

  it('renders exactly one row per data item, with title and detail', () => {
    render(<Component />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(items.length);
    for (const item of items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.detail)).toBeInTheDocument();
      expect(screen.getByText(item.type)).toBeInTheDocument();
    }
  });

  it('keeps the shared hairline list styling', () => {
    const { container } = render(<Component />);
    // List container carries the top rule; every row a bottom rule.
    expect(container.querySelectorAll('.border-t.border-hairline')).toHaveLength(1);
    expect(container.querySelectorAll('.border-b.border-hairline')).toHaveLength(
      items.length
    );
  });

  it('renders rows in document order matching the data array', () => {
    const { container } = render(<Component />);
    const rows = [...container.querySelectorAll('h3')];
    expect(rows.map((el) => el.textContent)).toEqual(items.map((i) => i.title));
    expect(within(container).getAllByRole('heading', { level: 3 })).toHaveLength(
      items.length
    );
  });
});
