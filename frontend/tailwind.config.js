/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf7',
          100: '#f7f2e7',
          200: '#eee1cc',
          300: '#e1cba7',
          400: '#d1ab7d',
          500: '#c08d56',
          600: '#b17647',
          700: '#935d3b',
          800: '#774b34',
          900: '#613e2e',
          950: '#351f17',
        },
        stationery: {
          paper: '#fcfaf7',
          ink: '#2b2927',
          accent: '#8b5cf6',
          sage: '#4a7c59',
          terracotta: '#c85a32'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif']
      }
    },
  },
  plugins: [],
}
