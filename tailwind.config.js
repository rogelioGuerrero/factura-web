/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          bg: '#121212',
          surface: '#1e1e1e',
          border: '#333333',
          text: '#ffffff',
          muted: '#b0b0b0',
          accent: '#64b5f6',
        },
        light: {
          bg: '#f5f7fa',
          surface: '#ffffff',
          border: '#e0e0e0',
          text: '#333333',
          muted: '#666666',
          accent: '#2196f3',
        },
        sidebar: {
          bg: '#1a2233',
          text: '#ffffff',
          hover: 'rgba(255, 255, 255, 0.1)',
          active: 'rgba(255, 255, 255, 0.2)',
        }
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        corporate: {
          primary: "oklch(55% 0.046 257.417)",
          'primary-content': '#fff',
          'rounded-box': '0.5rem',
          'rounded-btn': '0.5rem',
          'rounded-badge': '0.5rem',
        }
      },
      "light", "dark", "cupcake", "retro", "dracula", {nord: {
      "color-scheme": "light",
      "base-100": "oklch(95.127% 0.007 260.731)",
      "base-200": "oklch(93.299% 0.01 261.788)",
      "base-300": "oklch(89.925% 0.016 262.749)",
      "base-content": "oklch(32.437% 0.022 264.182)",
      "primary": "oklch(59.435% 0.077 254.027)",
      "primary-content": "oklch(11.887% 0.015 254.027)",
      "secondary": "oklch(69.651% 0.059 248.687)",
      "secondary-content": "oklch(13.93% 0.011 248.687)",
      "accent": "oklch(77.464% 0.062 217.469)",
      "accent-content": "oklch(15.492% 0.012 217.469)",
      "neutral": "oklch(45.229% 0.035 264.131)",
      "neutral-content": "oklch(89.925% 0.016 262.749)",
      "info": "oklch(69.207% 0.062 332.664)",
      "info-content": "oklch(13.841% 0.012 332.664)",
      "success": "oklch(76.827% 0.074 131.063)",
      "success-content": "oklch(15.365% 0.014 131.063)",
      "warning": "oklch(85.486% 0.089 84.093)",
      "warning-content": "oklch(17.097% 0.017 84.093)",
      "error": "oklch(60.61% 0.12 15.341)",
      "error-content": "oklch(12.122% 0.024 15.341)",
      "--rounded-box": "1rem",
      "--rounded-btn": "1rem",
      "--rounded-badge": "1rem",
      "--animation-btn": "0.25s",
      "--animation-input": "0.25s",
      "--btn-focus-scale": "0.95",
      "--border-btn": "1.5px",
      "--tab-border": "1px",
      "--tab-radius": "0.5rem",
    }}],
  },
}
