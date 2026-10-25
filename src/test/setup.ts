// Global test setup — runs before every test file.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom ships no matchMedia. Components call it at lazy-init time
// (Nav's isMobile initializer, App's useBubbleEnabled), so a missing
// implementation throws during render rather than at effect time.
// Default stub reports "no match" (desktop / pointer-device) so the
// desktop branch is the default; individual tests override via
// window.matchMedia = ... when they need the mobile branch.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom ships no requestIdleCallback (Nav arms the mobile menu with it).
if (!window.requestIdleCallback) {
  window.requestIdleCallback = ((cb: IdleRequestCallback) =>
    window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0)) as typeof window.requestIdleCallback;
  window.cancelIdleCallback = ((id?: number) => window.clearTimeout(id)) as typeof window.cancelIdleCallback;
}

// jsdom only provides rAF under pretendToBeVisual; the scroll-spy hook is
// rAF-throttled, so tests need it unconditionally to await a frame.
if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(performance.now()), 0)) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = ((id?: number) => window.clearTimeout(id)) as typeof window.cancelAnimationFrame;
}

// jsdom has no scrollTo on elements; scroll-into-view paths would throw.
// (Window scrolling stays unimplemented, so tests must drive a real scroll
// surface — see lib/useScrollSpy tests.)
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// jsdom has no ResizeObserver; <Glass> sizes its lens through one, so without
// a stub every component test that renders Glass throws on mount. The stub
// never fires callbacks — Glass falls back to its initial box, which is all
// these tests assert on (markup, not measured geometry).
if (typeof window.ResizeObserver === 'undefined') {
  class StubResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): ResizeObserverEntry[] {
      return [];
    }
  }
  window.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;
}

// Silence React act() warnings from intentional non-act usage in unit tests.
vi.spyOn(console, 'error').mockImplementation(() => {});
