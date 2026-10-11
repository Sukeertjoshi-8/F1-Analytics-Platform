/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          dark: '#0B0E14',
          card: '#131823',
          cardLight: '#1C2333',
          border: '#232D42',
          accent: '#FF1801',
          gold: '#FFD200',
          teal: '#00D2BE',
          gray: '#94A3B8',
          textMuted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Titillium Web', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'f1-glow': '0 0 20px -3px rgba(225, 6, 0, 0.35)',
        'card-glow': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
