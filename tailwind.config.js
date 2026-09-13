/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        nike: ['"Nike Futura"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        nike: {
          red: '#FA5400',
          black: '#111111',
          white: '#FFFFFF',
          gray: {
            50: '#F8F8F8',
            100: '#F1F1F1',
            200: '#E6E6E6',
            300: '#D1D1D1',
            400: '#ABABAB',
            500: '#7F7F7F',
            600: '#666666',
            700: '#4C4C4C',
            800: '#333333',
            900: '#1A1A1A',
          }
        }
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      }
    },
  },
  plugins: [],
};