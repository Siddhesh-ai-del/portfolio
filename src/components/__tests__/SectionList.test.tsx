// Contract for the shared section shell used by /06–/08. Copying Research's
// markup three times would give three places to drift, so the pattern lives
// here once — these tests pin the parts that must match the rest of the page.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionList from '../SectionList';

const items = [
  { type: 'Alpha', title: 'First title', detail: 'First detail' },
  { type: 'Beta', title: 'Second title', detail: 'Second detail' },
  { type: 'Gamma', title: 'Third title', detail: 'Third detail' },
];

const renderSection = (props = {}) =>
  render(
    <SectionList
      id="example"
      number="/09"
      title="Example Title"
      items={items}
      {...props}
    />
  );

describe('SectionList', () => {
  it('anchors the section with the given id', () => {
    renderSection();
    expect(document.getElementById('example')).not.toBeNull();
  });

  it('renders the eyebrow number and heading', () => {
    renderSection();
    expect(screen.getByText('/09')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Example Title' })
    ).toBeInTheDocument();
  });

  it('renders a 12-column header row with the trailing rule', () => {
    const { container } = renderSection();
    const header = container.querySelector('.md\\:grid-cols-12');
    expect(header).not.toBeNull();
    expect(header?.querySelector('.w-20.h-px.bg-hairline')).not.toBeNull();
  });

  it('renders one row per item: chip, title and detail', () => {
    renderSection();
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles).toHaveLength(3);
    expect(titles[1]).toHaveTextContent('Second title');
    expect(screen.getByText('First detail')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('staggers the rows on the same 40ms ladder as Research', () => {
    const { container } = renderSection();
    const delays = [...container.querySelectorAll<HTMLElement>('.reveal')].map(
      (el) => el.style.getPropertyValue('--reveal-delay')
    );
    // [header, row0, row1, row2]: the header carries no delay and rows step
    // 0 / 40 / 80ms — identical to Research's `i * 40` ladder (a 0ms delay
    // omits the custom property entirely).
    expect(delays).toEqual(['', '', '40ms', '80ms']);
  });

  it('renders an empty list as just the header (no empty rows)', () => {
    renderSection({ items: [] });
    // queryAllBy, not getAllBy: "none found" is the expected outcome here.
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(document.querySelector('.border-t.border-hairline')).not.toBeNull();
  });
});
