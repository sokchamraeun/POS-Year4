import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // recharts 3 pulls its own React-using deps; force a single React instance
  // and pre-bundle recharts so dev mode doesn't load a duplicate copy of React.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['recharts'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/khqrpay': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
