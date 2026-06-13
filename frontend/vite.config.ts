import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@admin':      path.resolve(__dirname, './src/admin'),
      '@user':       path.resolve(__dirname, './src/user'),
      '@shared':     path.resolve(__dirname, './src/shared'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@ui':         path.resolve(__dirname, './src/shared/ui'),
      '@hooks':      path.resolve(__dirname, './src/shared/hooks'),
      '@services':   path.resolve(__dirname, './src/shared/services'),
      '@contexts':   path.resolve(__dirname, './src/shared/contexts'),
      '@utils':      path.resolve(__dirname, './src/shared/utils'),
      '@ig-types':   path.resolve(__dirname, './src/shared/types'),
      '@assets':     path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
        },
      },
    },
  },
})
