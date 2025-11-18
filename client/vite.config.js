import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(),
    mkcert() // Genera certificados SSL automáticamente
  ],
  server: {
    https: true, // Habilitar HTTPS
    host: '0.0.0.0', // Necesario para Docker y acceso desde red local
    port: 5173,
    watch: {
      usePolling: true // Necesario para hot-reload en Docker
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false // Permitir proxy a HTTP desde HTTPS
      }
    }
  }
})
