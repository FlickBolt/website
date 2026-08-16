/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan every source that can emit a class name. Page JS is included because
  // several pages build markup with innerHTML (live-index, dashboard-*, auth).
  content: [
    "./**/*.{html,md}",
    "./assets/js/**/*.js",
    "!./_site/**",
    "!./node_modules/**",
    "!./vendor/**",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
