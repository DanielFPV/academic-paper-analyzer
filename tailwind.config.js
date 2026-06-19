/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fafafa',
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
      },
      maxWidth: {
        'container': '1200px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
