import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'tranquil-fascination-production.up.railway.app',
      '.railway.app', // Permite todos los subdominios de railway.app
    ],
    host: '0.0.0.0',
    port: process.env.PORT || 8080,
  },
})
