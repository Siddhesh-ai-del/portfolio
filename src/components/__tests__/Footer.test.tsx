// Footer — pins the contact links (security-relevant `rel` convention) and
// the bottom-padding clearance the floating bottom pill now depends on.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('keeps the #connect anchor for deep links', () => {
    render(<Footer />);
    expect(document.getElementById('connect')).not.toBeNull();
  });

  // The bottom pill's pane hangs ~60px above the document end, landing on
  // this padding — shrink it and the pill covers the copyright bar.
  it('reserves bottom padding for the bottom pill', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('pb-20', 'md:pb-24');
  });

  it('hardens every outbound link against tab-nabbing and referrer leaks', () => {
    render(<Footer />);
    const outbound = screen.getAllByRole('link').filter((a) =>
      a.getAttribute('href')?.startsWith('http')
    );
    expect(outbound.length).toBeGreaterThan(0);
    for (const link of outbound) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('leaves the mailto link same-tab (no _blank to harden)', () => {
    render(<Footer />);
    const mail = screen.getByRole('link', { name: /email/i });
    expect(mail.getAttribute('href')).toMatch(/^mailto:/);
    expect(mail).not.toHaveAttribute('target', '_blank');
  });
});
