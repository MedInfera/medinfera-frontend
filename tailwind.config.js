/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0efff',
          200: '#badefd',
          300: '#7ec3fb',
          400: '#39a4f6',
          500: '#0f87e8',
          600: '#0369c5',
          700: '#0453a0',
          800: '#084784',
          900: '#0c3c6d',
          950: '#082549',
        },
        teal: {
          50:  '#edfaf6',
          100: '#d2f4ea',
          200: '#a8e8d5',
          300: '#6fd6bb',
          400: '#38bc9e',
          500: '#1aa183',
          600: '#11816a',
          700: '#106756',
          800: '#115244',
          900: '#10443a',
        },
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.4s ease both',
        'slide-in': 'slideIn 0.3s ease both',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
