// Harness smoke test — proves the vitest/jsdom/Testing-Library stack works
// before any feature test depends on it: jsdom DOM, jest-dom matchers, and the
// matchMedia shim that components need at lazy-init time.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

function Sample() {
  return (
    <div>
      <p data-testid="greeting">hello</p>
      <button aria-pressed="false">toggle</button>
    </div>
  );
}

describe('test harness', () => {
  it('renders into jsdom', () => {
    render(<Sample />);
    expect(screen.getByTestId('greeting')).toHaveTextContent('hello');
  });

  it('exposes jest-dom matchers', () => {
    render(<Sample />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('provides the matchMedia shim components rely on', () => {
    expect(typeof window.matchMedia).toBe('function');
    const mq = window.matchMedia('(max-width: 47.9375rem)');
    expect(mq.matches).toBe(false);
    expect(mq.media).toBe('(max-width: 47.9375rem)');
  });
});
