/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono-display': ['"Major Mono Display"', 'monospace'],
      },
      spacing: {
        '18': '4.5rem', // 72px
      },
      colors: {
        gemini: {
          bg: '#000000',
          surface: '#1E1F20',
          bubble: '#333538',
          border: '#333538',
          hover: '#2A2B2D',
          text: '#E3E3E3',
          muted: '#C4C7C5',
        },
      },
    },
  },
  plugins: [],
}
