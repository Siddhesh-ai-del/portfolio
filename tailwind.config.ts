// Tailwind design tokens — maps the site's editorial palette and type scale
// to utility classes. `extend` (not `theme`) so Tailwind's default palette
// stays available alongside these. Scanned content globs below decide which
// classes are emitted, so a class written only in index.css won't be generated.
import type { Config } from 'tailwindcss';

const config: Config = {
  // index.html + src: the only two places class names appear.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // paper/ink — page surface + primary text (bg-paper-deep alternates
        // section backgrounds; ink-soft is the muted heading variant).
        paper: {
          DEFAULT: '#FAF7F0',
          deep: '#F3EEE1',
        },
        ink: {
          DEFAULT: '#201E1B',
          soft: '#3A3631',
        },
        // hairline — the 1px rules that separate sections/rows everywhere.
        hairline: {
          DEFAULT: '#E7E0D0',
        },
        // bronze — accent for eyebrows, hover states, links, and the
        // availability dot; 300–600 gives a usable contrast ramp.
        bronze: {
          300: '#CE9C6D',
          400: '#BD7A44',
          500: '#A15E2C',
          600: '#7C4520',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F8F4EC',
          200: '#F2EDE2',
          300: '#EBE4D5',
        },
        // espresso — secondary text ramp; higher number = darker = more
        // contrast (espresso-700/800 carry body copy, 300–500 decoration).
        espresso: {
          900: '#2C2A29',
          800: '#3D3A37',
          700: '#524E4A',
          600: '#6B6660',
          500: '#8A847C',
          400: '#A49F97',
          300: '#BFBBB4',
        },
        // sage — muted green-grey for large ghost numerals and quiet accents.
        sage: {
          200: '#D8DDCC',
          300: '#C2CBB3',
          400: '#A3B091',
          500: '#8A9A78',
          600: '#6F7E5E',
        },
        beige: {
          200: '#E8E0D1',
          300: '#DCD2BE',
          400: '#C9BCA1',
        },
      },
      // Family order matters: these become .font-serif/.font-sans/.font-mono,
      // matching the @font-face declarations in src/index.css (latin subsets).
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        'wide-sm': '0.08em',
        // ultrawide — the 0.22em tracking used by all uppercase mono labels.
        'ultrawide': '0.22em',
      },
      // ease-zen — the shared deceleration curve (fast out, settle in) used by
      // essentially every color/transform transition on the page. NOTE: some
      // components reference a nonexistent `zen-ease` class, which Tailwind
      // never generates — those transitions fall back to the default timing.
      transitionTimingFunction: {
        zen: 'cubic-bezier(0.16,1,0.3,1)',
      },
      lineHeight: {
        body: '1.5',
        heading: '1.05',
      },
    },
  },
  plugins: [],
};

export default config;
