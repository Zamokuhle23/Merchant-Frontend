import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: { usePolling: true },
    proxy: {
      '/api': {
        target: 'http://129.151.190.212:8000',
        changeOrigin: true,
      },
    },
  },
})
