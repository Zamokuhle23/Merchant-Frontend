import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: { usePolling: true },
    proxy: {
      '/api': {
        target: 'http://145.241.187.64:8081',
        changeOrigin: true,
      },
    },
  },
})
