import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
