/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // TailwindCSS v4 prefix với colon
  prefix: 'tw:',
  
  // Important selector for scoping
  important: '.tarot-app-wrapper',
  
  theme: {
    extend: {},
  },
  
  plugins: [],
  
  // TailwindCSS v4 specific config
  corePlugins: {
    preflight: false, // Disable base styles reset
  },
}