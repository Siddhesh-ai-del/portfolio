import ScrollReveal from './ScrollReveal';

const stackCategories = [
  { title: 'Languages', tools: ['Python', 'C++ (Basic)', 'TypeScript'] },
  { title: 'AI & Data Science', tools: ['NumPy', 'Machine Learning', 'Gemini AI'] },
  { title: 'LLMs & AI Tooling', tools: ['Ollama', 'Local LLMs', 'Google AI Studio'] },
  { title: 'Frameworks', tools: ['React', 'Tailwind CSS', 'Firebase'] },
  { title: 'Tools', tools: ['Git', 'GitHub'] },
  { title: 'Operating Systems', tools: ['Linux (CachyOS)', 'Windows'] },
];

export default function Stack() {
  return (
    <section id="stack" className="py-24 md:py-32 bg-paper-deep px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline mb-14 md:mb-24">
            <div className="md:col-span-2">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bronze-500">/04</span>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-4xl md:text-5xl tracking-[-0.03em] leading-none text-ink">Stack & Infrastructure</h2>
            </div>
            <div className="hidden md:block md:col-span-2 md:justify-self-end">
              <div className="w-20 h-px bg-hairline" />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-14">
          {stackCategories.map((cat, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="border-t border-hairline pt-6">
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-espresso-600">
                    {cat.title}
                  </span>
                  <span className="font-mono text-[10px] text-espresso-400">0{i + 1}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {cat.tools.map((tool, j) => (
                    <span
                      key={j}
                      className="font-medium text-2xl md:text-3xl tracking-[-0.01em] text-ink hover:text-bronze-500 transition-colors duration-300 zen-ease cursor-default w-fit"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}