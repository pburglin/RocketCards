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
        primary: '#9E7FFF',
        'primary-dark': '#8A6BFF',
        'primary-light': '#B39DFF',
        secondary: '#38bdf8',
        'secondary-dark': '#0EA5E9',
        'secondary-light': '#7DD3FC',
        accent: '#f472b6',
        'accent-dark': '#EC4899',
        'accent-light': '#FDA4AF',
        background: '#171717',
        surface: '#262626',
        'surface-light': '#3F3F46',
        text: '#FFFFFF',
        'text-secondary': '#A3A3A3',
        border: '#2F2F2F',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 8s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glow: {
          '0%': { textShadow: '0 0 5px rgba(158, 127, 255, 0.5)' },
          '100%': { textShadow: '0 0 15px rgba(158, 127, 255, 0.8)' }
        }
      },
      boxShadow: {
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 35px -5px rgba(0, 0, 0, 0.6), 0 15px 20px -10px rgba(0, 0, 0, 0.4)'
      },
      borderRadius: {
        'card': '16px',
        'button': '12px'
      }
    },
  },
  plugins: [],
}
