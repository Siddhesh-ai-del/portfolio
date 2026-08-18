export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="connect" className="pt-24 md:pt-36 pb-12 md:pb-16 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end border-t border-hairline pt-16 md:pt-20 mb-16 md:mb-24">
          <div className="md:col-span-8">
            <p className="font-serif italic text-4xl md:text-6xl leading-[1.1] tracking-normal text-ink max-w-2xl">
              Passionate about AI, Python, and Linux — let's build something meaningful together.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-4">
            <a
              href="https://github.com/Siddhesh-ai-del"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-600 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-300 zen-ease"
            >
              GitHub
              <span className="transition-transform duration-300 zen-ease group-hover:translate-x-1">→</span>
            </a>
            <a
              href="https://www.linkedin.com/in/siddhesh-kadlag-36a5b3352"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-600 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-300 zen-ease"
            >
              LinkedIn
              <span className="transition-transform duration-300 zen-ease group-hover:translate-x-1">→</span>
            </a>
            <a
              href="mailto:captainlevi252@gmail.com"
              className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-espresso-600 hover:text-bronze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bronze-500 rounded-sm transition-colors duration-300 zen-ease"
            >
              Email
              <span className="transition-transform duration-300 zen-ease group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-hairline pt-6">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-espresso-600">
            © {year} Siddhesh Kadlag
          </p>
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-espresso-500">
            Built with care and caffeine
          </p>
        </div>
      </div>
    </footer>
  );
}