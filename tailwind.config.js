/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#135bec",
        "background-light": "#fcfcfd",
        "background-dark": "#000000",
        "card-dark": "#0a0a0a",
        "surface-dark": "#0a0a0a",
        "text-secondary": "#71717a",
        "border-dark": "#18181b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
