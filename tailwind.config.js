// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all files in src for Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
