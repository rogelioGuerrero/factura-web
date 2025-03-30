import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Asegurarse de que Vite genere correctamente los assets
    assetsInlineLimit: 4096,
    // Configuración para SPA
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Configuración base para Netlify
  base: '/',
})
