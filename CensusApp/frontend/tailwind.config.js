/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Includes all files in /src
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366f1',
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
        },
        secondary: {
          light: '#f472b6',
          DEFAULT: '#ec4899',
          dark: '#db2777',
        },
        tertiary: {
          light: '#fdba74',
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
      },
    },
  },
  plugins: [],
};