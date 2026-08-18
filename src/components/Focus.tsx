import ScrollReveal from './ScrollReveal';

const focusAreas = [
  { num: '01', title: 'Artificial Intelligence', desc: 'Building practical AI projects with Python, NumPy, and machine learning fundamentals.' },
  { num: '02', title: 'Local LLMs & AI Tooling', desc: 'Running and experimenting with local models using Ollama, Google AI Studio, and Gemini.' },
  { num: '03', title: 'Linux & Systems', desc: 'Daily Linux (CachyOS) user focused on tooling, automation, and open-source workflows.' },
  { num: '04', title: 'Software Engineering', desc: 'Developing practical applications with Git, GitHub, React, and TypeScript.' },
];

export default function Focus() {
  return (
    <section id="focus" className="py-24 md:py-36 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline mb-14 md:mb-24">
            <div className="md:col-span-2">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bronze-500">/01</span>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-4xl md:text-5xl tracking-[-0.03em] leading-none text-ink">Focus</h2>
            </div>
            <div className="hidden md:block md:col-span-2 md:justify-self-end">
              <div className="w-20 h-px bg-hairline" />
            </div>
          </div>
        </ScrollReveal>

        <div className="border-t border-hairline">
          {focusAreas.map((area, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-baseline py-10 md:py-14 border-b border-hairline cursor-default">
                <div className="md:col-span-2">
                  <span className="text-6xl md:text-7xl font-light text-sage-300 group-hover:text-bronze-500 transition-colors duration-500 zen-ease leading-none">
                    {area.num}
                  </span>
                </div>
                <div className="md:col-span-10">
                  <h3 className="text-2xl md:text-3xl tracking-[-0.02em] text-ink group-hover:text-bronze-500 transition-colors duration-500 zen-ease mb-2">
                    {area.title}
                  </h3>
                  <p className="text-espresso-700 text-base leading-relaxed max-w-2xl">
                    {area.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}