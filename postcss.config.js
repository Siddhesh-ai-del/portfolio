// PostCSS pipeline — runs for every stylesheet Vite processes:
// Tailwind (generates the utility classes found in the content globs from
// tailwind.config.ts) first, then autoprefixer (adds vendor prefixes for
// the browserslist targets). Order matters: Tailwind output is what needs
// prefixing.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
