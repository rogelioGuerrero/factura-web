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
  plugins: [],
}