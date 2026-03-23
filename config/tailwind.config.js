export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'border-tertiary': '#E5E3DC',
        'border-secondary': '#D5D3CC',
        'border-primary': '#C5C3BC',
        'text-tertiary': '#999999',
        'text-secondary': '#666666',
        'text-primary': '#333333',
        'background-secondary': '#F5F5F5',
        'background-primary': '#FFFFFF',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['Monaco', 'monospace'],
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
      }
    },
  },
  plugins: [],
}
