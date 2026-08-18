import ScrollReveal from './ScrollReveal';

const researchItems = [
  { type: 'Leadership', title: 'Section Leader (Selected) — Stanford Code in Place 2026', detail: 'Unable to teach due to university examinations and academic commitments' },
  { type: 'Participant', title: 'Student Participant — Stanford Code in Place 2025', detail: 'Python programming and problem-solving' },
  { type: 'Leadership', title: 'Team Captain — Smart India Hackathon', detail: 'Led a multidisciplinary team; qualified through the institute\u2019s internal selection round' },
  { type: 'Award', title: 'Second Prize — Prompt Engineering Competition', detail: 'College technical event' },
];

export default function Research() {
  return (
    <section id="research" className="py-24 md:py-36 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline mb-14 md:mb-24">
            <div className="md:col-span-2">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bronze-500">/03</span>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-4xl md:text-5xl tracking-[-0.03em] leading-none text-ink">Positions &amp; Activities</h2>
            </div>
            <div className="hidden md:block md:col-span-2 md:justify-self-end">
              <div className="w-20 h-px bg-hairline" />
            </div>
          </div>
        </ScrollReveal>

        <div className="border-t border-hairline">
          {researchItems.map((item, i) => (
            <ScrollReveal key={i} delay={i * 40}>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-baseline py-6 md:py-8 border-b border-hairline cursor-default">
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
                  <span className="text-espresso-300 group-hover:text-bronze-500 transition-all duration-500 zen-ease group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}