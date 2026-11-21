/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDFBF7', ink: '#2A2420', muted: '#74685F', line: '#EBE4D6',
        terra: { DEFAULT: '#C85A32', soft: '#F8E3D9', dark: '#A7461F' },
        sage: { DEFAULT: '#4A6B5D', soft: '#E3ECE7' },
      },
      fontFamily: { display: ['"Young Serif"', 'Georgia', 'serif'], sans: ['Figtree', 'system-ui', 'sans-serif'] },
      keyframes: {
        sheet: { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        fall: { '0%': { transform: 'translateY(-10vh) rotate(0)', opacity: '1' }, '100%': { transform: 'translateY(105vh) rotate(720deg)', opacity: '0' } },
      },
      animation: { sheet: 'sheet .3s cubic-bezier(.2,.8,.2,1)', fade: 'fade .2s ease', fall: 'fall 2.4s ease-in forwards' },
    },
  },
  plugins: [],
}
