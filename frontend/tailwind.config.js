/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        mio: {
          lime: '#bdf559',
          violet: '#7647eb',
          'violet-light': '#815ae1',
          surface: '#f9f9fa',
          paper: '#faf8f5',
          obsidian: '#0b0914',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      }
    }
  },
  plugins: []
};
