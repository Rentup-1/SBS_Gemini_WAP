
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'system-ui', 'sans-serif'],
    },
    // Override default colors
    extend: {
      // Add custom scrollbar styles
      scrollbar: ['rounded'],
      width: {
        16: "4rem", // 64px
        64: "16rem", // 256px
      },
      transitionDuration: {
        300: "300ms",
      },

    },
  },
  plugins: [require('tailwind-scrollbar')],
}