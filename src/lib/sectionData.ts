// Data for the three post sections (/06 Hackathons, /07 Events, /08 Posts).
//
// PLACEHOLDER CONTENT — every entry below is scaffolding: the category chip,
// title and right-hand detail are all meant to be replaced with real items.
// Each array feeds one section via its component in src/components, and each
// entry has the same shape as Research's `researchItems`, so the rows render
// identically (mono chip → title → right-aligned detail).
//
// To fill these in: edit the arrays here (one place, no component changes
// needed) and keep 2–4 entries — the section renders whatever is in the array,
// including an empty one (header only).
export interface SectionItem {
  /** Mono category chip in the left column (e.g. Winner, Talk, Article). */
  type: string;
  /** The primary line. */
  title: string;
  /** Right-aligned qualifier (year · team · result). */
  detail: string;
}

/** /06 Hackathons — PLACEHOLDER rows. */
export const hackathonItems: SectionItem[] = [
  { type: 'Winner', title: 'First hackathon (placeholder)', detail: '2026 · team · prize' },
  { type: 'Finalist', title: 'Second hackathon (placeholder)', detail: '2025 · team · placement' },
  { type: 'Participant', title: 'Third hackathon (placeholder)', detail: '2025 · team' },
];

/** /07 Events — PLACEHOLDER rows (talks, meetups, conferences). */
export const eventItems: SectionItem[] = [
  { type: 'Talk', title: 'First talk (placeholder)', detail: '2026 · venue' },
  { type: 'Workshop', title: 'Second workshop (placeholder)', detail: '2025 · duration' },
  { type: 'Attendee', title: 'Third event (placeholder)', detail: '2025 · city' },
];

/** /08 Posts — PLACEHOLDER rows (articles, write-ups, notes). */
export const postItems: SectionItem[] = [
  { type: 'Article', title: 'First post (placeholder)', detail: '2026 · 5 min read' },
  { type: 'Write-up', title: 'Second post (placeholder)', detail: '2025 · 8 min read' },
  { type: 'Notes', title: 'Third post (placeholder)', detail: '2025 · 4 min read' },
];
