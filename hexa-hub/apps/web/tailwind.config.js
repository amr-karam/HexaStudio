/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        foreground: '#ffffff',
        accent: '#D4A843',
        gold: '#D4A843',
        obsidian: '#0A0A0A',
        surface: '#121212',
        border: '#262626',
      },
    },
  },
  plugins: [],
};
