import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAF7F0',
          deep: '#F3EEE1',
        },
        ink: {
          DEFAULT: '#201E1B',
          soft: '#3A3631',
        },
        hairline: {
          DEFAULT: '#E7E0D0',
        },
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
        espresso: {
          900: '#2C2A29',
          800: '#3D3A37',
          700: '#524E4A',
          600: '#6B6660',
          500: '#8A847C',
          400: '#A49F97',
          300: '#BFBBB4',
        },
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
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        'wide-sm': '0.08em',
        'ultrawide': '0.22em',
      },
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
