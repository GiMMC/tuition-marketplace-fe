/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // Indigo 600
          hover: '#4338ca', // Indigo 700
          foreground: '#ffffff',
        },
        background: '#f8fafc',
        surface: '#ffffff',
      }
    },
  },
  plugins: [],
}
