/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3525cd',
          50:  '#ededfc',
          100: '#d4d2f8',
          200: '#a8a5f1',
          300: '#7b77ea',
          400: '#4f4ae3',
          500: '#3525cd',
          600: '#2b1ea4',
          700: '#21177b',
          800: '#160f52',
          900: '#0b0829',
        },
        tertiary: {
          DEFAULT: '#1e2a5e',
          50:  '#ebedf7',
          100: '#c8ccec',
          200: '#9fa6d9',
          300: '#7580c6',
          400: '#4c5ab3',
          500: '#3545a0',
          600: '#2a378a',
          700: '#1e2a5e',   // sidebar admin
          800: '#131c42',
          900: '#090e26',
        },
        surface: '#f5f5fa',
        'on-surface': '#1c1b1f',
        outline:   '#cac4d0',
        error:    '#b3261e',
        success:  '#186a3b',
        warning:  '#9c6a00',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        modal: '0 20px 60px rgba(0,0,0,.18)',
      },
    },
  },
  plugins: [],
};
