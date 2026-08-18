import ScrollReveal from './ScrollReveal';

const certifications = [
  {
    name: 'Stanford Code in Place 2025',
    issuer: 'Stanford University',
    date: '2025',
    id: 'Student Participant',
    verify: 'https://codeinplace.stanford.edu/',
  },
  {
    name: 'Stanford Code in Place 2026',
    issuer: 'Stanford University',
    date: '2026',
    id: 'Section Leader (Selected)',
    verify: 'https://codeinplace.stanford.edu/',
  },
];

export default function Certifications() {
  return (
    <section className="py-24 md:py-36 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline mb-14 md:mb-24">
            <div className="md:col-span-2">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bronze-500">/05</span>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-4xl md:text-5xl tracking-[-0.03em] leading-none text-ink">Certifications &amp; Licensing</h2>
            </div>
            <div className="hidden md:block md:col-span-2 md:justify-self-end">
              <div className="w-20 h-px bg-hairline" />
            </div>
          </div>
        </ScrollReveal>

        <div className="border-t border-hairline">
          {certifications.map((cert, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center py-6 md:py-8 border-b border-hairline">
                <div className="md:col-span-6">
                  <h3 className="font-medium text-xl md:text-2xl tracking-[-0.015em] text-ink group-hover:text-bronze-500 transition-colors duration-500 zen-ease">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-espresso-600 mt-1.5">
                    {cert.issuer} · {cert.date}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-espresso-600">
                    {cert.id}
                  </span>
                </div>
                <div className="md:col-span-3 md:text-right">
                  <a
                    href={cert.verify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-600 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-300 zen-ease"
                  >
                    Verify
                    <span className="transition-transform duration-300 zen-ease group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}