// SectionList — the shared shell for the post sections (/06–/08).
//
// The page's sections all follow one pattern: mono "/0N" eyebrow → 12-col
// header (2 eyebrow / 8 title / 2 rule) → hairline list of rows that reveal
// on a stagger. Rather than copying Research's markup three times (three
// files that could drift apart), the pattern lives here once and each section
// is a thin wrapper supplying its id, number, title and data.
//
// Row layout is Research's 2/7/2/1 split — mono category chip → title →
// right-aligned detail → hover arrow — because all three new sections carry
// the same `type / title / detail` row shape as Research's activity list.
// An item may ALSO carry optional `image / description / facts / gallery`
// fields, which render a featured block (banner + copy + fact tags + photo
// strip) under the row header — see eventItems in lib/sectionData.ts.
import ScrollReveal from './ScrollReveal';
import type { SectionItem } from '../lib/sectionData';

interface SectionListProps {
  /** DOM id — the scroll-spy anchor the bottom pill targets. */
  id: string;
  /** Eyebrow number, e.g. "/06". */
  number: string;
  /** Section heading (h2). */
  title: string;
  items: readonly SectionItem[];
  /** Extra classes for the <section> (background band alternation). */
  className?: string;
}

export default function SectionList({
  id,
  number,
  title,
  items,
  className = '',
}: SectionListProps) {
  return (
    <section id={id} className={`py-24 md:py-36 px-6 sm:px-8 ${className}`.trim()}>
      <div className="max-w-7xl mx-auto">
        {/* Header row: 2-col eyebrow, 8-col title, 2-col rule (desktop only). */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline mb-14 md:mb-24">
            <div className="md:col-span-2">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bronze-500">
                {number}
              </span>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-4xl md:text-5xl tracking-[-0.03em] leading-none text-ink">
                {title}
              </h2>
            </div>
            <div className="hidden md:block md:col-span-2 md:justify-self-end">
              <div className="w-20 h-px bg-hairline" />
            </div>
          </div>
        </ScrollReveal>

        <div className="border-t border-hairline">
          {items.map((item, i) => {
            // A row is "featured" when it carries media or copy beyond the
            // chip/title/detail triple; plain rows render exactly as before.
            const featured = Boolean(
              item.image || item.description || item.facts || item.team || item.gallery
            );
            // With a banner, the text column fills the half beside it (the
            // auto-placer continues at col 8); without one it indents to the
            // title column so copy aligns under the heading, not the chip.
            const textSpan = item.image
              ? 'md:col-span-5'
              : 'md:col-start-3 md:col-span-9';
            return (
              // Stagger: i * 40ms — Research's ladder, the quickest on the page,
              // because these rows are short one-liners.
              // NOTE: `zen-ease` is a no-op class (config defines `ease-zen`).
              <ScrollReveal key={i} delay={i * 40}>
                <div className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-baseline py-6 md:py-8 border-b border-hairline cursor-default">
                  {/* 2/7/2/1 columns: category chip → title → detail → hover
                      arrow (arrow hidden on mobile where the detail column
                      already reads right-aligned). */}
                  <div className="md:col-span-2">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-bronze-500">
                      {item.type}
                    </span>
                  </div>
                  <div className="md:col-span-7">
                    <h3 className="font-medium text-xl md:text-2xl tracking-[-0.015em] text-ink group-hover:text-bronze-500 transition-colors duration-500 zen-ease">
                      {item.title}
                    </h3>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <p className="text-sm text-espresso-600 leading-relaxed">{item.detail}</p>
                  </div>
                  <div className="hidden md:flex md:col-span-1 justify-end">
                    <span className="text-espresso-300 group-hover:text-bronze-500 transition-[color,transform] duration-500 zen-ease group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  {/* Featured block — spans the full list width beneath the
                      header columns. `items-start` because the row grid is
                      baseline-aligned: baselining a figure against text would
                      sink the image to the text's baseline. Media/feature
                      columns indent to col 3 so everything lines up under the
                      title. */}
                  {featured && (
                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start mt-4 md:mt-6">
                      {item.image && (
                        <figure className="md:col-start-3 md:col-span-5">
                          <img
                            src={item.image.src}
                            alt={item.image.alt}
                            width={700}
                            height={400}
                            loading="lazy"
                            decoding="async"
                            className={`w-full aspect-[7/4] object-cover border border-hairline ${item.image.position ?? 'object-center'}`}
                          />
                        </figure>
                      )}
                      {(item.description || item.facts || item.team) && (
                        <div className={textSpan}>
                          {item.description && (
                            <p className="text-base md:text-lg text-espresso-600 leading-[1.75] max-w-[62ch]">
                              {item.description}
                            </p>
                          )}
                          {item.team && (
                            // Team credit — its own hairline-separated block so
                            // the roster reads as a distinct fact, not part of
                            // the event description.
                            <div className="mt-5 border-t border-hairline pt-4">
                              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-bronze-500">
                                Team {item.team.name}
                              </span>
                              <ul className="mt-2 space-y-1">
                                {item.team.members.map((member) => (
                                  <li
                                    key={member}
                                    className="text-sm text-espresso-600 leading-relaxed"
                                  >
                                    {member}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.facts && (
                            <ul className="mt-5 flex flex-wrap gap-2">
                              {item.facts.map((fact) => (
                                <li
                                  key={fact}
                                  className="font-mono text-[10px] tracking-[0.18em] uppercase text-bronze-500 border border-hairline px-2.5 py-1.5"
                                >
                                  {fact}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      {item.gallery && (
                        // Cover-cropped to a uniform 3:2 so the strip reads as
                        // one line; `position` per photo keeps the subject in
                        // frame. On mobile (2 cols) the last photo takes the
                        // full row instead of sitting half-empty.
                        <div className="md:col-start-3 md:col-span-10 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {item.gallery.map((shot) => (
                            <img
                              key={shot.src}
                              src={shot.src}
                              alt={shot.alt}
                              loading="lazy"
                              decoding="async"
                              className={`w-full aspect-[3/2] object-cover border border-hairline last:col-span-2 md:last:col-span-1 ${shot.position ?? 'object-center'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
