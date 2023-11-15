/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976D2',
        primaryDark: '#48a4f4',
        darkBg: '#252526',
      },
    },
  },
  plugins: [],
  prefix: 'tw-',
  darkMode: 'class',
};
