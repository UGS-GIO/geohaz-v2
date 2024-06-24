// removing this import temporarily because it breaks tailwindcss
// import calcitePreset from './calcite-preset';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Manual theming
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '0 4px 16px 0 rgba(0, 0, 0, 0.18), 0 2px 8px 0 rgba(0, 0, 0, 0.34)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};