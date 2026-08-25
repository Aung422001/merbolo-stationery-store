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
          50:  '#FEF3E2',  // cream / lightest
          100: '#FDE8B0',  // light golden
          200: '#FDD17A',  // golden yellow
          300: '#FBBA42',  // warm yellow
          400: '#F99B20',  // amber
          500: '#F47B00',  // deep orange
          600: '#E85D00',  // orange-red
          700: '#D93D1A',  // vivid red-orange
          800: '#C12F10',  // deep red
          900: '#9B2008',  // darkest red
          950: '#5C1005',  // near-black red
        },
        stationery: {
          paper: '#FEF9F0',
          ink: '#2b1a0e',
          accent: '#F47B00',
          sage: '#4a7c59',
          terracotta: '#D93D1A'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif']
      },
      keyframes: {
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up':    'fade-in-up 0.5s ease-out both',
        'fade-in':       'fade-in 0.4s ease-out both',
        'slide-in-left': 'slide-in-left 0.5s ease-out both',
        'scale-in':      'scale-in 0.4s ease-out both',
        'pulse-soft':    'pulse-soft 2s ease-in-out infinite',
        'float':         'float 3s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
