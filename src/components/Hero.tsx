import ScrollReveal from './ScrollReveal';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col px-6 sm:px-8 pt-36 md:pt-44 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        <ScrollReveal>
          <div className="flex items-baseline justify-between mb-16 md:mb-24">
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-espresso-600">
              Portfolio / Index
            </span>
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-espresso-600">
              AI & DS Student
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="text-ink leading-[0.98] tracking-[-0.04em] text-[clamp(3rem,8.5vw,7.5rem)]">
            Siddhesh Kadlag
          </h1>
        </ScrollReveal>

        <div className="mt-auto pt-20 md:pt-28 grid grid-cols-1 md:grid-cols-12 gap-10 items-end pb-20 md:pb-28">
          <ScrollReveal delay={200} className="md:col-span-7">
            <p className="font-serif italic text-2xl md:text-[1.75rem] text-espresso-700 leading-snug max-w-xl">
              Second-year B.E. Artificial Intelligence &amp; Data Science student passionate about AI, Python, Linux, and problem-solving.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300} className="md:col-span-5">
            <div className="md:text-right">
              <span className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] uppercase text-espresso-600">
                <span className="h-1.5 w-1.5 rounded-full bg-bronze-500" aria-hidden="true" />
                Available for collaboration
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}