/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#a855f7',
          green: '#22c55e',
          red: '#ef4444',
        },
        bg: {
          primary: '#030712',
          secondary: '#0f172a',
          tertiary: '#1e293b',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}