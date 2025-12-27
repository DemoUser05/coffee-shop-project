/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          light: '#D7CCC8',
          DEFAULT: '#795548',
          dark: '#5D4037',
        },
        accent: {
          DEFAULT: '#FF9800',
          light: '#FFB74D',
        }
      },
      fontFamily: {
        'display': ['"Dancing Script"', 'cursive'],
        'body': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}