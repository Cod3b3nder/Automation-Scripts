/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff00',
        'neon-blue': '#00f7ff',
        'neon-red': '#ff0033',
        'dark-bg': '#0a0a0a',
        'panel-bg': '#111111',
      },
      fontFamily: {
        mono: ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};