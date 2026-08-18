import ScrollReveal from './ScrollReveal';

const caseStudies = [
  {
    roman: 'I',
    title: 'Micro Journal',
    summary: 'A privacy-first, AI-powered minimalist journaling web application with real-time emotional analytics.',
    challenge: 'Designing AI-driven emotional insights while keeping user journal data private and secure.',
    tech: 'React, TypeScript, Tailwind CSS, Firebase, Gemini AI',
    metric1: 'Privacy-first',
    metric2: 'Real-time',
    repo: 'https://github.com/Siddhesh-ai-del',
  },
  {
    roman: 'II',
    title: 'Local AI Development Environment',
    summary: 'Configured local LLMs using Ollama and tested coding and reasoning models for software development.',
    challenge: 'Setting up and benchmarking local models for development without relying on cloud APIs.',
    tech: 'Ollama, Local LLMs, Linux',
    metric1: 'Local-first',
    metric2: 'No cloud',
    repo: 'https://github.com/Siddhesh-ai-del',
  },
  {
    roman: 'III',
    title: 'Personal Portfolio Website',
    summary: 'Designed and deployed a personal portfolio website.',
    challenge: 'Building a performant, custom-designed portfolio with a distinctive visual identity.',
    tech: 'React, TypeScript, Tailwind CSS',
    metric1: 'Custom design',
    metric2: 'Deployed',
    repo: 'https://github.com/Siddhesh-ai-del',
  },
];

export default function Systems() {
  return (
    <section id="systems" className="py-24 md:py-32 bg-paper-deep px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline mb-14 md:mb-24">
            <div className="md:col-span-2">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bronze-500">/02</span>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-4xl md:text-5xl tracking-[-0.03em] leading-none text-ink">Systems</h2>
            </div>
            <div className="hidden md:block md:col-span-2 md:justify-self-end">
              <div className="w-20 h-px bg-hairline" />
            </div>
          </div>
        </ScrollReveal>

        <div className="border-t border-hairline">
          {caseStudies.map((study, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-12 md:py-16 border-b border-hairline">
                <div className="md:col-span-1">
                  <span className="font-serif italic text-xl text-sage-300 group-hover:text-bronze-500 transition-colors duration-500 zen-ease">
                    {study.roman}
                  </span>
                </div>

                <div className="md:col-span-5">
                  <h3 className="text-3xl md:text-4xl tracking-[-0.02em] leading-[1.05] text-ink group-hover:text-bronze-500 transition-colors duration-500 zen-ease">
                    {study.title}
                  </h3>
                  <p className="mt-4 text-espresso-700 leading-relaxed max-w-md">
                    {study.summary}
                  </p>
                  <p className="mt-5 text-sm text-espresso-600 leading-relaxed max-w-md">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-espresso-600 block mb-1.5">
                      Core challenge
                    </span>
                    {study.challenge}
                  </p>
                </div>

                <div className="md:col-span-4">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-espresso-600 block mb-3">
                    Stack
                  </span>
                  <p className="text-espresso-800 text-sm leading-relaxed">{study.tech}</p>
                  <div className="mt-8 flex items-end gap-10">
                    <div className="flex-1 border-t border-hairline pt-4">
                      <span className="text-3xl font-medium tracking-[-0.02em] text-ink block">{study.metric1}</span>
                    </div>
                    <div className="flex-1 border-t border-hairline pt-4">
                      <span className="text-3xl font-medium tracking-[-0.02em] text-ink block">{study.metric2}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 md:text-right">
                  <a
                    href={study.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-600 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-300 zen-ease"
                  >
                    View
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