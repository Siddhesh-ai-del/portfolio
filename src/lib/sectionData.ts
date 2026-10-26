// Data for the three post sections (/06 Hackathons, /07 Events, /08 Posts).
//
// Each array feeds one section via its component in src/components, and the
// base entry shape matches Research's `researchItems`, so rows render
// identically (mono chip → title → right-aligned detail).
//
// Events carries REAL content (IdeaFusion 2026–27) using the optional
// "featured" fields below — image / description / facts / gallery — which
// SectionList renders as an inline block under the row header. Hackathons and
// Posts are still PLACEHOLDER scaffolding: replace their entries with real
// items the same way, no component changes needed. The section renders
// whatever is in the array, including an empty one (header only).
export interface SectionItem {
  /** Mono category chip in the left column (e.g. Winner, Talk, Article). */
  type: string;
  /** The primary line. */
  title: string;
  /** Right-aligned qualifier (year · team · result). */
  detail: string;
  /** Long-form copy for a featured row, under the header columns. */
  description?: string;
  /** Mono fact tags (hairline chips) under the description. */
  facts?: readonly string[];
  /** Team credit (name + members) between the copy and the fact tags. */
  team?: SectionTeam;
  /** Banner image shown beside the description (featured rows). */
  image?: SectionImage;
  /** Supporting photos rendered as a gallery under the featured block. */
  gallery?: readonly SectionImage[];
}

/** An image on a featured row. */
export interface SectionImage {
  /** Public URL (files live in public/events/). */
  src: string;
  /** Describes the photo for screen readers — never a filename. */
  alt: string;
  /** Cover-crop anchor for images whose own ratio differs from the tile's.
   *  Must stay a literal Tailwind class (scanned from this file). Photos
   *  that are already the tile ratio don't need it. */
  position?: 'object-top' | 'object-center' | 'object-bottom';
}

/** A team credit: name plus members, each with year/branch. */
export interface SectionTeam {
  /** Rendered as "Team <name>". */
  name: string;
  /** e.g. "Siddhesh V Kadlag — SE AIDS". */
  members: readonly string[];
}

/** /06 Hackathons — PLACEHOLDER rows. */
export const hackathonItems: SectionItem[] = [
  { type: 'Winner', title: 'First hackathon (placeholder)', detail: '2026 · team · prize' },
  { type: 'Finalist', title: 'Second hackathon (placeholder)', detail: '2025 · team · placement' },
  { type: 'Participant', title: 'Third hackathon (placeholder)', detail: '2025 · team' },
];

/** /07 Events — real entries. IdeaFusion is a featured row (banner,
 *  description, fact tags and a photo gallery under the header). */
export const eventItems: SectionItem[] = [
  {
    type: 'Ideathon',
    title: 'IdeaFusion 2026–27',
    detail: '2026–27 · IEEE · Pune',
    description:
      'IdeaFusion 2026–27 is an innovation-focused ideathon organized by the ' +
      'IEEE Student Branch in association with the IEEE Pune Section. It asks ' +
      'students for practical, technology-driven solutions to real-world ' +
      'problems across HealthTech, EdTech, FinTech, AgriTech, MedTech and ' +
      'Open Innovation — both software and hardware ideas are welcome. ' +
      'Participation is in-person in Pune: every team gets 7 minutes to ' +
      'present its idea, followed by 3 minutes of Q&A with the judges.',
    facts: [
      'IEEE Student Branch × IEEE Pune Section',
      'In-person · Pune',
      '7 min pitch + 3 min Q&A',
      'Software & hardware',
    ],
    team: {
      name: 'IRIS',
      members: [
        'Siddhesh V Kadlag — SE AIDS',
        'Harshal R Pawar — SE CE',
        'Prachi Kale — SE AIDS',
      ],
    },
    image: {
      src: '/events/ideafusion-banner.jpeg',
      alt: 'IdeaFusion 2026–27 event banner',
      position: 'object-center',
    },
    gallery: [
      {
        // Pre-cropped to the tile's exact 3:2 from the full portrait, framed
        // on the slide + presenter (the ceiling above them is gone — anchoring
        // the tall original with object-top used to show nothing but that).
        src: '/events/ideafusion-presenting.jpg',
        alt: 'Team presenting their RetinaScan AI idea on stage at IdeaFusion 2026–27',
        position: 'object-center',
      },
      {
        src: '/events/ideafusion-judges.jpg',
        alt: 'The team holding their certificates with the judges at IdeaFusion 2026–27',
        position: 'object-center',
      },
      {
        src: '/events/ideafusion-certificates.jpg',
        alt: 'Close-up of the IdeaFusion 2026–27 certificates',
        position: 'object-center',
      },
    ],
  },
];

/** /08 Posts — PLACEHOLDER rows (articles, write-ups, notes). */
export const postItems: SectionItem[] = [
  { type: 'Article', title: 'First post (placeholder)', detail: '2026 · 5 min read' },
  { type: 'Write-up', title: 'Second post (placeholder)', detail: '2025 · 8 min read' },
  { type: 'Notes', title: 'Third post (placeholder)', detail: '2025 · 4 min read' },
];
