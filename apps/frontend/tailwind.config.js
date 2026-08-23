/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F7FA',
        card: '#FFFFFF',
        border: '#E5E7EB',
        primary: {
          DEFAULT: '#0B1F33',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#D97316',
          foreground: '#ffffff',
        },
        success: '#15803D',
        warning: '#B45309',
        danger: '#ef4444',  // red-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -12px rgba(15, 23, 42, 0.12)',
        'lift': '0 22px 45px -20px rgba(15, 23, 42, 0.28)',
      }
    },
  },
  plugins: [],
}
